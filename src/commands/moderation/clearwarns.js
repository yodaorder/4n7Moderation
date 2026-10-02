const {
    SlashCommandBuilder
} = require("discord.js");

const {
    isModerator
} = require("../../systems/permissions");

const {
    log
} = require("../../systems/logger");

const UserWarnings =
    require("../../database/models/UserWarnings");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("clearwarns")
        .setDescription("Remove all warnings from a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User whose warnings will be removed")
                .setRequired(true)
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


        const result =
            await UserWarnings.deleteMany({

                guildID:
                    interaction.guild.id,

                userID:
                    user.id

            });


        if (result.deletedCount === 0) {

            return interaction.reply({
                content:
                    `✅ <@${user.id}> has no warnings.`,
                ephemeral: true
            });

        }


        const reason =
            `Cleared ${result.deletedCount} warning(s)`;


        await interaction.reply({
            content:
                `🧹 Removed **${result.deletedCount}** warning(s) from <@${user.id}>.`
        });


        await log(
            interaction.guild,
            "CLEARWARNS",
            user.id,
            interaction.user.id,
            reason
        );

    }

};