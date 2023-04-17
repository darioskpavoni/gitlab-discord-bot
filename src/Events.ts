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
        const isDraft =
            event.object_attributes.detailed_merge_status === "draft_status"
                ? true
                : false;

        if (isDraft) {
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
