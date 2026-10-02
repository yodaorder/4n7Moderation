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
        .setName("mute")
        .setDescription("Timeout a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to timeout")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Timeout duration in minutes")
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the timeout")
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

        const minutes =
            interaction.options.getInteger("minutes");

        const reason =
            interaction.options.getString("reason")
            || "No reason provided";


        if (user.id === interaction.user.id) {

            return interaction.reply({
                content: "❌ You cannot mute yourself.",
                ephemeral: true
            });

        }


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be timed out.",
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


        if (!member.moderatable) {

            return interaction.reply({
                content: "❌ I cannot timeout this user. Check my permissions and role hierarchy.",
                ephemeral: true
            });

        }


        try {

            await member.timeout(
                minutes * 60 * 1000,
                reason
            );


            await interaction.reply({
                content:
                    `🔇 **Muted / Timed out** <@${user.id}>\n` +
                    `**User ID:** \`${user.id}\`\n` +
                    `**Duration:** ${minutes} minute(s)\n` +
                    `**Reason:** ${reason}`
            });


            await log(
                interaction.guild,
                "MUTE",
                user.id,
                interaction.user.id,
                reason,
                `${minutes} minute(s)`
            );


        } catch (error) {

            console.error("Mute error:", error);

            return interaction.reply({
                content: "❌ I could not timeout that user.",
                ephemeral: true
            });

        }

    }

};