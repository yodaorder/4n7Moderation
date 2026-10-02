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
        .setName("softban")
        .setDescription("Ban and immediately unban a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to softban")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the softban")
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
                content: "❌ You cannot softban yourself.",
                ephemeral: true
            });

        }


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be softbanned.",
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
                    content: "❌ I cannot softban this user. Check my role hierarchy and permissions.",
                    ephemeral: true
                });

            }

        }


        const existingBan =
            await interaction.guild.bans.fetch(user.id)
                .catch(() => null);


        if (existingBan) {

            return interaction.reply({
                content: "❌ That user is already banned.",
                ephemeral: true
            });

        }


        try {

            await interaction.guild.members.ban(

                user.id,

                {
                    deleteMessageSeconds: 604800,
                    reason
                }

            );


            await interaction.guild.members.unban(
                user.id,
                `Softban: ${reason}`
            );


            await interaction.reply({
                content:
                    `🔨 **Softbanned** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "SOFTBAN",
                user.id,
                interaction.user.id,
                reason
            );


        } catch (error) {

            console.error("Softban error:", error);

            return interaction.reply({
                content: "❌ I could not softban that user.",
                ephemeral: true
            });

        }

    }

};