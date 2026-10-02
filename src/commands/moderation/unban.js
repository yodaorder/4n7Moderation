const {
    SlashCommandBuilder
} = require("discord.js");

const {
    isModerator
} = require("../../systems/permissions");

const {
    log
} = require("../../systems/logger");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user")

        .addStringOption(option =>
            option
                .setName("userid")
                .setDescription("Discord user ID")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the unban")
                .setRequired(false)
        ),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


        const userID =
            interaction.options.getString("userid");

        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        if (!/^\d{17,20}$/.test(userID)) {

            return interaction.reply({
                content: "❌ That is not a valid Discord user ID.",
                ephemeral: true
            });

        }


        const ban =
            await interaction.guild.bans.fetch(userID)
                .catch(() => null);


        if (!ban) {

            return interaction.reply({
                content: `❌ <@${userID}> is not currently banned.`,
                ephemeral: true
            });

        }


        try {

            await interaction.guild.members.unban(
                userID,
                reason
            );


            await interaction.reply({
                content:
                    `✅ **Unbanned** <@${userID}>\n` +
                    `**User ID:** \`${userID}\`\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "UNBAN",
                userID,
                interaction.user.id,
                reason
            );


        } catch (error) {

            console.error("Unban error:", error);

            return interaction.reply({
                content: "❌ I could not unban that user.",
                ephemeral: true
            });

        }

    }

};