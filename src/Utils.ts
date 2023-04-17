export class Utils {
    public static howLongAgo(date: Date) {
        const now = new Date();

        const diffMs = Math.abs(now.getTime() - date.getTime());

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const timeDiff = {
            days: days,
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60,
        };

        let timeDiffForHumans: string = "";
        if (timeDiff.days !== 0) {
            timeDiffForHumans = `${timeDiff.days}d`;
            return timeDiffForHumans;
        }

        if (timeDiff.hours !== 0) {
            timeDiffForHumans = `${timeDiff.hours}h`;
            return timeDiffForHumans;
        }

        timeDiffForHumans = `${timeDiff.minutes}m`;
        return timeDiffForHumans;
    }
}
