import { Bot } from "./Bot";
import { Events } from "./Events";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

export class Server {
    private static server: Server;

    private app: express.Application;
    private port: number;

    public static init() {
        if (!this.server) {
            return new Server();
        }

        return this.server;
    }

    constructor() {
        this.app = express();
        this.port = 3000;

        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.json());

        this.app.get("/", (req, res) => {
            res.send("Hello World!");
        });

        this.app.post("/", (req, res) => {
            const event = req.body;
            Events.handle(event);
            res.sendStatus(200);
        });

        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
            Bot.init();
        });
    }
}

Server.init();
