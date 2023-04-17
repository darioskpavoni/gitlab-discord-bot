import fs from "fs";

export class Title {
    public static random() {
        if (!fs.existsSync(process.env.TITLES_FILE as string)) {
            return `You have a new MR`;
        }
        const titles = JSON.parse(
            fs.readFileSync(process.env.TITLES_FILE as string).toString()
        ) as string[];

        const min = 0;
        const max = titles.length;
        const index = Math.floor(Math.random() * (max - min) + min);

        return titles[index];
    }
}
