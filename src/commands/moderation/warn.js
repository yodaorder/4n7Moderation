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

const UserWarnings =
    require("../../database/models/UserWarnings");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to warn")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the warning")
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
                content: "❌ You cannot warn yourself.",
                ephemeral: true
            });

        }


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be warned.",
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
                content: "❌ You cannot warn this user because of the role hierarchy.",
                ephemeral: true
            });

        }


        try {

            const warning =
                await UserWarnings.create({

                    guildID:
                        interaction.guild.id,

                    userID:
                        user.id,

                    moderatorID:
                        interaction.user.id,

                    reason:
                        reason

                });


            await interaction.reply({
                content:
                    `⚠️ **Warned** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Reason:** ${reason}\n` +
                    `**Warning ID:** \`${warning._id}\``
            });


            await log(
                interaction.guild,
                "WARN",
                user.id,
                interaction.user.id,
                reason
            );


            await user.send(
                `⚠️ You received a warning in **${interaction.guild.name}**.\nReason: ${reason}`
            ).catch(() => {});


        } catch (error) {

            console.error("Warn error:", error);

            return interaction.reply({
                content: "❌ I could not save that warning.",
                ephemeral: true
            });

        }

    }

};