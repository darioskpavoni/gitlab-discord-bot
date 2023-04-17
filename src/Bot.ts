import fs from "fs";
import {
    ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    EmbedBuilder,
} from "discord.js";
import { Commands } from "./models/Commands";
import { IUsers } from "./models/Users";
import { Title } from "./Title";
import { Utils } from "./Utils";

export class Bot {
    private static bot: Client;

    private static users: IUsers;
    private static discordUserMap: Map<string, string>;
    private static gitlabUserMap: Map<string, string>;

    public static async init() {
        this.loadUsers();

        // TODO: Check if any intents can be removed
        this.bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
            partials: [Partials.Channel, Partials.Message],
        });

        this.bot.login(process.env.DISCORD_BOT_TOKEN);

        this.bot.once(Events.ClientReady, async (c) => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
            await this.registerCommands();
        });

        this.bot.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            switch (interaction.commandName) {
                case Commands.PING:
                    await interaction.reply("Pong!");
                    break;
                case Commands.SUBSCRIBE:
                    const subscribe = await this.subscribeUser(interaction);
                    await interaction.reply(subscribe);
                    break;
                case Commands.UNSUBSCRIBE:
                    const unsubscribe = await this.unsubscribeUser(interaction);
                    await interaction.reply(unsubscribe);
                    break;
                case Commands.MR:
                    const mr = await this.getUserMRs(interaction);
                    await interaction.reply({ embeds: [mr] });
                    break;

                default:
                    break;
            }
        });
    }

    private static async registerCommands() {
        return new Promise<void>((resolve, reject) => {
            const commands = [
                {
                    name: Commands.PING,
                    description: "Replies with Pong!",
                },
                {
                    name: Commands.SUBSCRIBE,
                    description:
                        "Subscribe user to Gitlab notification service",
                },
                {
                    name: Commands.UNSUBSCRIBE,
                    description:
                        "Unsubscribe user from Gitlab notification service",
                },
                {
                    name: Commands.MR,
                    description:
                        "Your MRs to review. Spoiler: the fewer, the better!`",
                },
            ];

            const rest = new REST({ version: "10" }).setToken(
                process.env.DISCORD_BOT_TOKEN as string
            );

            (async () => {
                try {
                    console.log("Started refreshing application (/) commands.");

                    await rest.put(
                        Routes.applicationCommands(
                            process.env.CLIENT_ID as string
                        ),
                        {
                            body: commands,
                        }
                    );

                    console.log(
                        "Successfully reloaded application (/) commands."
                    );

                    return resolve();
                } catch (error) {
                    console.error(error);
                    return reject();
                }
            })();
        });
    }

    public static async sendDM(userId: string, msg: string) {
        this.bot.users.send(userId, msg);
    }

    public static async sendEmbed(userId: string, embed: EmbedBuilder) {
        this.bot.users.send(userId, { embeds: [embed] });
    }

    private static async loadUsers() {
        if (!fs.existsSync(process.env.USERS_FILE as string)) {
            console.log("No users files, skipping step");
            return;
        }

        const users = JSON.parse(
            fs.readFileSync(process.env.USERS_FILE as string).toString()
        );

        if (users.length === 0) {
            return;
        }

        this.users = users;
        this.discordUserMap = new Map();
        this.gitlabUserMap = new Map();

        // Map real names to Gitlab user IDs
        // e.g. ("Name Surname","123123123")
        const res = await fetch(
            `https://gitlab.com/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/users`,
            {
                headers: {
                    "PRIVATE-TOKEN": process.env.GITLAB_BOT_API_TOKEN as string,
                },
            }
        );
        const gitlabUsers = await res.json();
        for (const i in gitlabUsers) {
            this.gitlabUserMap.set(
                gitlabUsers[i].name as string,
                gitlabUsers[i].id
            );
        }

        for (const i in this.users) {
            if (!this.users[i].id) {
                continue;
            }

            // Map real name to Discord ID
            // e.g. ("Name Surname", "111111111111111111")
            this.discordUserMap.set(i, this.users[i].id as string);
        }
    }

    private static subscribeUser(
        interaction: ChatInputCommandInteraction
    ): Promise<string> {
        return new Promise((resolve) => {
            const id = interaction.user.id;
            const username = interaction.user.username;
            const discriminator = interaction.user.discriminator;

            let userFound: boolean = false;
            for (const i in this.users) {
                if (
                    this.users[i].username === username &&
                    this.users[i].discriminator === discriminator
                ) {
                    if (this.users[i]?.subscribed) {
                        return resolve(
                            "You are already subscribed to the notification service."
                        );
                    }

                    // TODO: Maybe don't store this ID in the file... doesn't seem safe
                    userFound = true;
                    this.users[i].id = id;
                    this.users[i].subscribed = true;

                    this.discordUserMap.set(i, this.users[i].id as string);
                }
            }

            if (!userFound) {
                console.log("User not in list, skipping subscription");
                return resolve("Your username is not in the whitelist.");
            }

            try {
                fs.writeFileSync(
                    process.env.USERS_FILE as string,
                    JSON.stringify(this.users)
                );
                return resolve("Subscribed to Gitlab notification service!");
            } catch (error) {
                console.log(`Could not save users to file`);
                return resolve(
                    "An error occurred while registering you to the notification service."
                );
            }
        });
    }

    private static unsubscribeUser(interaction: ChatInputCommandInteraction) {
        return new Promise<string>((resolve) => {
            const username = interaction.user.username;
            const discriminator = interaction.user.discriminator;

            let userFound: boolean = false;
            for (const i in this.users) {
                if (
                    this.users[i].username === username &&
                    this.users[i].discriminator === discriminator
                ) {
                    userFound = true;
                    if (this.users[i].subscribed) {
                        delete this.users[i].id;
                        delete this.users[i].subscribed;
                        this.discordUserMap.delete(i);
                    }
                }

                if (!userFound) {
                    console.log("User not in list, skipping subscription");
                    return resolve("Your username is not in the whitelist.");
                }

                try {
                    fs.writeFileSync(
                        process.env.USERS_FILE as string,
                        JSON.stringify(this.users)
                    );
                    return resolve(
                        "You have been unsubscribed from the notification service."
                    );
                } catch (error) {
                    console.log(`Could not save users to file`);
                    return resolve(
                        "An error occurred while registering you to the notification service."
                    );
                }
            }
        });
    }

    public static notifyMR(
        assignee: string | undefined,
        assigneeAvatarUrl: string | undefined,
        reviewers: string[],
        project: string,
        src: string,
        dest: string,
        url: string,
        title: string
    ) {
        for (const rev of reviewers) {
            const discordUserID = this.discordUserMap.get(rev) as string;
            if (rev === assignee || !discordUserID) {
                // Comment next line if you want to receive notifications about your own MRs => useful for testing
                // continue;
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(Title.random())
                .setURL(url)
                .addFields(
                    {
                        name: "Project",
                        value: project,
                    },
                    { name: "Title", value: title },
                    {
                        name: "Branch",
                        value: `${src} → ${dest}`,
                        inline: true,
                    }
                );

            if (assignee) {
                embed.setAuthor({
                    name: assignee,
                    iconURL: assigneeAvatarUrl ? assigneeAvatarUrl : "",
                    url: url,
                });
            }

            this.sendEmbed(discordUserID, embed);
        }
    }

    private static getUserMRs(interaction: ChatInputCommandInteraction) {
        return new Promise<EmbedBuilder>(async (resolve) => {
            // get gitlab user ID from discord ID
            let realUserName: string = "";
            for (const i in this.users) {
                if (
                    `${this.users[i].username}#${this.users[i].discriminator}` ===
                    `${interaction.user.username}#${interaction.user.discriminator}`
                ) {
                    realUserName = i;
                    break;
                }
            }

            let gitlabUserID: string = "";
            for (let [key, value] of this.gitlabUserMap) {
                if (key === realUserName) {
                    gitlabUserID = value;
                }
            }

            // get user's MRs from gitlab
            const data = await fetch(
                `https://gitlab.com/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/merge_requests?reviewer_id=${gitlabUserID}&state=opened`,
                {
                    headers: {
                        "PRIVATE-TOKEN": process.env
                            .GITLAB_BOT_API_TOKEN as string,
                    },
                }
            );
            const mrs = await data.json();

            // put each MR in the embed
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("MRs to review");

            mrs.map((mr: any) => {
                embed.addFields({
                    name: `${mr.title || "No title"} - ${Utils.howLongAgo(
                        new Date(mr.updated_at)
                    )} ago`,
                    value: mr.web_url,
                });
            });

            return resolve(embed);
        });
    }
}
