const {
    SlashCommandBuilder
} = require("discord.js");

const {
    isModerator,
    canModerate
} = require("../../systems/permissions");

const {
    log
} = require("../../systems/logger");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to kick")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the kick")
                .setRequired(false)
        ),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


        const user =
            interaction.options.getUser("user");

        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        if (user.id === interaction.user.id) {

            return interaction.reply({
                content: "❌ You cannot kick yourself.",
                ephemeral: true
            });

        }


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be kicked.",
                ephemeral: true
            });

        }


        const member =
            await interaction.guild.members.fetch(user.id)
                .catch(() => null);


        if (!member) {

            return interaction.reply({
                content: "❌ That user is not in this server.",
                ephemeral: true
            });

        }


        if (!(await canModerate(interaction.member, member))) {

            return interaction.reply({
                content: "❌ You cannot moderate this user because of the role hierarchy.",
                ephemeral: true
            });

        }


        if (!member.kickable) {

            return interaction.reply({
                content: "❌ I cannot kick this user. Check my role hierarchy and permissions.",
                ephemeral: true
            });

        }


        try {

            await member.kick(reason);


            await interaction.reply({
                content:
                    `👢 **Kicked** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "KICK",
                user.id,
                interaction.user.id,
                reason
            );


        } catch (error) {

            console.error("Kick error:", error);

            return interaction.reply({
                content: "❌ I could not kick that user.",
                ephemeral: true
            });

        }

    }

};