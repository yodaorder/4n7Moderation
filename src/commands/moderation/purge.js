const {
    SlashCommandBuilder
} = require("discord.js");


const {
    isModerator
} = require("../../systems/permissions");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages from the current channel")

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of messages to delete")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


        const amount =
            interaction.options.getInteger("amount");


        const botMember =
            interaction.guild.members.me;


        if (
            !botMember ||
            !interaction.channel
                .permissionsFor(botMember)
                .has("ManageMessages")
        ) {

            return interaction.reply({
                content: "❌ I need **Manage Messages** permission in this channel.",
                ephemeral: true
            });

        }


        try {

            const deleted =
                await interaction.channel.bulkDelete(
                    amount,
                    true
                );


            await interaction.reply({

                content:
                    `🗑️ Deleted **${deleted.size}** message(s).`,

                ephemeral: true

            });

        } catch (error) {

            console.error("Purge error:", error);

            return interaction.reply({
                content: "❌ I could not delete those messages.",
                ephemeral: true
            });

        }

    }

};