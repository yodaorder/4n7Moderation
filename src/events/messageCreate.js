const {
    ApplicationCommandOptionType
} = require("discord.js");

const {
    handleMessage
} = require("../systems/automod");

const config = require("../config");


/*
==================================================
PREFIX COMMAND PARSER
==================================================
*/

function stripMention(value) {

    if (!value) {
        return null;
    }

    return value.replace(/[<@!>]/g, "");

}


async function resolveUser(client, guild, value) {

    const id = stripMention(value);

    if (!id) {
        return null;
    }

    if (!/^\d{17,20}$/.test(id)) {
        return null;
    }

    const member =
        await guild.members.fetch(id).catch(() => null);

    if (member) {
        return member.user;
    }

    return await client.users.fetch(id).catch(() => null);

}


async function resolveMember(guild, value) {

    const id = stripMention(value);

    if (!id) {
        return null;
    }

    if (!/^\d{17,20}$/.test(id)) {
        return null;
    }

    return await guild.members.fetch(id).catch(() => null);

}


function resolveRole(guild, value) {

    const id = stripMention(value);

    if (!id) {
        return null;
    }

    return guild.roles.cache.get(id) || null;

}


function resolveChannel(guild, value) {

    const id = stripMention(value);

    if (!id) {
        return null;
    }

    return guild.channels.cache.get(id) || null;

}



/*
==================================================
PARSE COMMAND ARGUMENTS
==================================================
*/

async function parseArguments(
    command,
    args,
    message
) {

    const commandData =
        command.data.toJSON();

    const options =
        commandData.options || [];

    const values = {};

    let index = 0;


    for (let i = 0; i < options.length; i++) {

        const option = options[i];

        const type =
            option.type;


        /*
        ==============================
        USER
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.User
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            values[option.name] =
                await resolveUser(
                    message.client,
                    message.guild,
                    raw
                );

            index++;

            continue;
        }


        /*
        ==============================
        INTEGER
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Integer
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            const value =
                Number.parseInt(raw, 10);

            values[option.name] =
                Number.isNaN(value)
                    ? null
                    : value;

            index++;

            continue;
        }


        /*
        ==============================
        NUMBER
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Number
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            const value =
                Number.parseFloat(raw);

            values[option.name] =
                Number.isNaN(value)
                    ? null
                    : value;

            index++;

            continue;
        }


        /*
        ==============================
        BOOLEAN
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Boolean
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            values[option.name] =
                raw.toLowerCase() === "true";

            index++;

            continue;
        }


        /*
        ==============================
        ROLE
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Role
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            values[option.name] =
                resolveRole(
                    message.guild,
                    raw
                );

            index++;

            continue;
        }


        /*
        ==============================
        CHANNEL
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Channel
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            values[option.name] =
                resolveChannel(
                    message.guild,
                    raw
                );

            index++;

            continue;
        }


        /*
        ==============================
        MENTIONABLE
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.Mentionable
        ) {

            const raw =
                args[index];

            if (!raw) {
                continue;
            }

            const user =
                await resolveUser(
                    message.client,
                    message.guild,
                    raw
                );

            if (user) {

                values[option.name] =
                    user;

            } else {

                values[option.name] =
                    resolveRole(
                        message.guild,
                        raw
                    );

            }

            index++;

            continue;
        }


        /*
        ==============================
        STRING
        ==============================
        */

        if (
            type === ApplicationCommandOptionType.String
        ) {

            const isLastString =
                options
                    .slice(i + 1)
                    .every(
                        next =>
                            next.type !==
                            ApplicationCommandOptionType.String
                    );


            /*
            Last string option gets
            the rest of the message.

            Example:

            !ban 123456789 spamming in chat

            user   = 123456789
            reason = spamming in chat
            */

            if (isLastString) {

                values[option.name] =
                    args
                        .slice(index)
                        .join(" ");

                index =
                    args.length;

            } else {

                values[option.name] =
                    args[index] || null;

                index++;

            }

            continue;
        }

    }


    return values;

}



/*
==================================================
PREFIX INTERACTION ADAPTER
==================================================
*/

class PrefixInteraction {

    constructor(
        message,
        commandName,
        values
    ) {

        this.client =
            message.client;

        this.guild =
            message.guild;

        this.guildId =
            message.guild.id;

        this.channel =
            message.channel;

        this.channelId =
            message.channel.id;

        this.member =
            message.member;

        this.user =
            message.author;

        this.author =
            message.author;

        this.commandName =
            commandName;

        this.createdTimestamp =
            message.createdTimestamp;

        this.replied =
            false;

        this.deferred =
            false;

        this._message =
            message;

        this._lastReply =
            null;


        this.options = {

            getUser: (name) =>
                values[name] || null,


            getString: (name) =>
                values[name] ?? null,


            getInteger: (name) =>
                values[name] ?? null,


            getNumber: (name) =>
                values[name] ?? null,


            getBoolean: (name) =>
                values[name] ?? null,


            getRole: (name) =>
                values[name] || null,


            getChannel: (name) =>
                values[name] || null,


            getMember: (name) =>
                values[name] || null,


            getMentionable: (name) =>
                values[name] || null

        };

    }


    async reply(data) {

        this.replied = true;

        this._lastReply =
            await this._message.channel.send(data);

        return this._lastReply;

    }


    async editReply(data) {

        if (
            this._lastReply
        ) {

            return await this._lastReply.edit(data);

        }

        this._lastReply =
            await this._message.channel.send(data);

        return this._lastReply;

    }


    async followUp(data) {

        return await this._message.channel.send(data);

    }


    async deleteReply() {

        if (this._lastReply) {

            return await this._lastReply.delete()
                .catch(() => {});

        }

    }

}



/*
==================================================
MESSAGE CREATE
==================================================
*/

module.exports = {

    name: "messageCreate",


    async execute(message) {

        if (
            !message.guild ||
            message.author.bot
        ) {
            return;
        }


        /*
        ==========================================
        RUN AUTOMOD
        ==========================================
        */

        await handleMessage(message);


        /*
        ==========================================
        CHECK PREFIX
        ==========================================
        */

        const prefix =
            config.DEFAULT_PREFIX;


        if (
            !message.content.startsWith(prefix)
        ) {
            return;
        }


        /*
        ==========================================
        PARSE MESSAGE
        ==========================================
        */

        const content =
            message.content.slice(
                prefix.length
            ).trim();


        if (!content) {
            return;
        }


        const args =
            content.split(/\s+/);


        const commandName =
            args.shift().toLowerCase();


        /*
        ==========================================
        FIND COMMAND
        ==========================================
        */

        const command =
            message.client.commands.get(
                commandName
            );


        if (!command) {
            return;
        }


        /*
        ==========================================
        BUILD PREFIX OPTIONS
        ==========================================
        */

        try {

            const values =
                await parseArguments(
                    command,
                    args,
                    message
                );


            /*
            ======================================
            CHECK REQUIRED OPTIONS
            ======================================
            */

            const commandData =
                command.data.toJSON();

            const options =
                commandData.options || [];


            for (
                const option of options
            ) {

                if (!option.required) {
                    continue;
                }


                const value =
                    values[option.name];


                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {

                    return message.channel.send(
                        `❌ Missing required argument: \`${option.name}\``
                    );

                }

            }


            /*
            ======================================
            CREATE PREFIX INTERACTION
            ======================================
            */

            const interaction =
                new PrefixInteraction(
                    message,
                    commandName,
                    values
                );


            /*
            ======================================
            RUN COMMAND
            ======================================
            */

            await command.execute(
                interaction
            );


        } catch (error) {

            console.error(
                `Prefix command error [${commandName}]:`,
                error
            );


            if (!message.deleted) {

                await message.channel.send(
                    "❌ There was an error executing that command."
                ).catch(() => {});

            }

        }

    }

};