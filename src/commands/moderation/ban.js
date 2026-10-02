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
        .setName("ban")
        .setDescription("Ban a user from the server")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to ban")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("delete_days")
                .setDescription("Delete up to 7 days of the user's messages")
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the ban")
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

        const deleteDays =
            interaction.options.getInteger("delete_days") ?? 0;

        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        if (user.id === interaction.user.id) {

            return interaction.reply({
                content: "❌ You cannot ban yourself.",
                ephemeral: true
            });

        }


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be banned by the bot.",
                ephemeral: true
            });

        }


        const member =
            await interaction.guild.members.fetch(user.id)
                .catch(() => null);


        if (member) {

            if (!(await canModerate(interaction.member, member))) {

                return interaction.reply({
                    content: "❌ You cannot moderate this user because of the role hierarchy.",
                    ephemeral: true
                });

            }


            if (!member.bannable) {

                return interaction.reply({
                    content: "❌ I cannot ban this user. Check my role hierarchy and permissions.",
                    ephemeral: true
                });

            }

        }


        try {

            await interaction.guild.members.ban(
                user.id,
                {
                    deleteMessageSeconds:
                        deleteDays * 86400,

                    reason
                }
            );


            await interaction.reply({
                content:
                    `🔨 **Banned** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "BAN",
                user.id,
                interaction.user.id,
                reason
            );


        } catch (error) {

            console.error("Ban error:", error);

            return interaction.reply({
                content: "❌ I could not ban that user.",
                ephemeral: true
            });

        }

    }

};