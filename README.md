# Gitlab Discord Bot

## Introduction

Behold, the GitLab Discord Bot - a custom solution that delivers instant notifications and comprehensive lists of active merge requests assigned to you! Struggling to stay on top of your GitLab MRs? Say goodbye to organizational headaches and let this bot revolutionize your workflow. Keep in mind that while the bot does not let you manage your MRs, it provides valuable data on new requests and active assignments with ease.

## Motivation

As of today (April 17th 2023), GitLab's interface for managing merge requests can be a bit chaotic, especially if you have a lot of MRs to review. It becomes difficult to differentiate between MRs that are still drafts and those that are approved. To resolve this issue, I created this bot, which helps you to easily manage your MRs by providing you with a list of active MRs for which you're the reviewer. Additionally, it notifies you on Discord whenever you're assigned as a reviewer for an MR, or when all the threads on an MR are resolved.

## Features

This bot provides the following features:

-   A Discord command that gives the user a list of active MRs for which they're the reviewer
-   Notification on Discord whenever the user is assigned as a reviewer for an MR, or when all the threads on an MR are resolved

## Setup

To set up this bot, follow these steps:

1. Clone the repository and take the `*.dist` files and remove the `.dist` portion in the filename.
2. Configure each file as desired

-   `.env` -> just follow along. Setting the `TITLES_FILE` is optional, leave it empty if you don't want it. If configured, the bot will use the custom headlines in the `TITLES_FILE` for the MR notifications, instead of the same headline every time.
-   `users.json` -> has an example in it. Add to this file the users in your Discord server that are going to use the bot.
-   `titles.json` -> as already said, contains custom headlines for the MR notifications. Every time there's a new MR, a random headline is taken from there.

3. Run `npm run watch`
4. Create a new webhook on GitLab by navigating to the project's settings page and selecting "Webhooks" from the left-hand menu. Set the IP address of the server running the GitLab Discord Bot and select "Merge Request Events" as the trigger. This will allow the bot to receive data on new merge requests. Note that support for new comments on MRs and pipeline statuses will be added in the future.

## Usage on Discord

To use the GitLab Discord Bot on your Discord server, follow these steps:

1. Invite the bot to your server using the provided link.
2. Once the bot has joined your server, use the command `/subscribe` to activate the bot's notifications for merge requests.
3. The bot will now send you notifications for assigned MRs. To see a list of all active MRs for which you're the reviewer, run the `/mr` command.
4. If you want to stop receiving notifications and using the bot, use the `/unsubscribe` command.
