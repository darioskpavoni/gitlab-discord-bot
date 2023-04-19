import { Bot } from "./Bot";
import { EventType } from "./models/EventType";

/**
 * Handles the events received from Gitlab (extracts useful info, passes it to Discord bot)
 */
export class Events {
    // TODO: Add typings to event
    public static handle(event: any) {
        const eventType = event.object_kind;

        switch (eventType) {
            case EventType.MERGE_REQUEST:
                this.handleMR(event);
                break;
            case EventType.NEW_COMMENT:
                // TODO: Implement new comment events
                break;
            case EventType.PIPELINE_STATUS:
                // TODO: Implement pipeline updates
                break;

            default:
                break;
        }
    }

    private static handleMR(event: any) {
        // No notifications on: draft MRs, approval/unapproval events, MR updated
        const isDraft = event.object_attributes.work_in_progress ? true : false;
        const isApprovalOrUnapproval =
            event.object_attributes.action === "approval" ||
            event.object_attributes.action === "unapproval"
                ? true
                : false;
        const isUpdate = event.object_attributes.oldrev ? true : false;

        // TODO: Find a way to detect threads resolved and not send notification if approved already. If not approved, just modify the notification to say "Threads solved on MR" -> Check the incoming MR id against the final mrs array in /mr (those mrs are unapproved). If MR is also in that array, send notification, otherwise skip

        if (isDraft || isApprovalOrUnapproval || isUpdate) {
            return;
        }

        /* Reviewers */
        const reviewers: string[] | undefined = event.reviewers
            ? event.reviewers.map((rev: any) => rev.name)
            : undefined;

        if (!reviewers) {
            return;
        }

        /* Assignee/Author (we only support only one assignee for now -> embed with multiple author might be weird ) */
        const assignee: string | undefined = event.assignees
            ? event.assignees.map((as: any) => as.name)[0]
            : undefined;
        const assigneeAvatarUrl: string | undefined = assignee
            ? event.assignees.map((as: any) => as.avatar_url)[0]
            : undefined;

        /* MR info */
        const project = event.project.name;
        const src = event.object_attributes.source_branch;
        const dest = event.object_attributes.target_branch;
        const url = event.object_attributes.url;
        const title = event.object_attributes.title;

        Bot.notifyMR(
            assignee,
            assigneeAvatarUrl,
            reviewers,
            project,
            src,
            dest,
            url,
            title
        );
    }
}
