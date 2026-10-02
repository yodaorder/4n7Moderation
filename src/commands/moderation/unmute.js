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
        .setName("unmute")
        .setDescription("Remove a user's timeout")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to unmute")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for removing the timeout")
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


        try {

            await member.timeout(
                null,
                reason
            );


            await interaction.reply({
                content:
                    `🔊 **Unmuted** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "UNMUTE",
                user.id,
                interaction.user.id,
                reason
            );


        } catch (error) {

            console.error("Unmute error:", error);

            return interaction.reply({
                content: "❌ I could not remove that timeout.",
                ephemeral: true
            });

        }

    }

};