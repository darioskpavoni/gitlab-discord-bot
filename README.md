# Gitlab Discord Bot

## Why did I create this bot?

As of today (April 17th 2023), the way Gitlab shows the merge requests assigned to you is a bit chaotic. If you have 10 MRs to review, you'll see all of them, even though some of them are still drafts. Besides, once you approved them, you keep seeing them in the same list as the others, making it confusing to see clearly if you have any new MRs to review or not. The only way I know, to see if you've already approved a MR, is to hover each MR and see what the popup says.

## Features

With this bot I wanted mostly to have the following features:

-   Have a Discord command which gives the user a list of active MRs for which they're the reviewer
-   Receive a notification on Discord whenever the user is assigned as reviewer for a MR, or when all the threads on a MR are resolved

## Setup

1. Take the `*.dist` files and remove the `.dist` portion in the filename.
2. Configure each file as desired
    - `.env` -> just follow along. Setting the `TITLES_FILE` is optional, leave it empty if you don't want it. If configured, the bot will use the custom headlines in the `TITLES_FILE` for the MR notifications, instead of the same headline every time.
    - `users.json` -> has an example in it. Add to this file the users in your Discord server that are going to use the bot.
    - `titles.json` -> as already said, contains custom headlines for the MR notifications. Every time there's a new MR, a random headline is taken from there.
