const {
    SlashCommandBuilder
} = require("discord.js");

const {
    isModerator
} = require("../../systems/permissions");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set the current channel's slowmode")

        .addIntegerOption(option =>
            option
                .setName("seconds")
                .setDescription("Slowmode delay in seconds")
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true)
        ),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


        const seconds =
            interaction.options.getInteger("seconds");


        const botMember =
            interaction.guild.members.me;


        if (
            !botMember ||
            !interaction.channel
                .permissionsFor(botMember)
                .has("ManageChannels")
        ) {

            return interaction.reply({
                content: "❌ I need **Manage Channels** permission in this channel.",
                ephemeral: true
            });

        }


        if (
            typeof interaction.channel.setRateLimitPerUser !==
            "function"
        ) {

            return interaction.reply({
                content: "❌ Slowmode is not supported in this channel.",
                ephemeral: true
            });

        }


        try {

            await interaction.channel.setRateLimitPerUser(
                seconds,
                `Changed by ${interaction.user.id}`
            );


            await interaction.reply({

                content:
                    seconds === 0

                        ? "🐌 Slowmode disabled."

                        : `🐌 Slowmode set to **${seconds} seconds**.`

            });

        } catch (error) {

            console.error("Slowmode error:", error);

            return interaction.reply({
                content: "❌ I could not change slowmode.",
                ephemeral: true
            });

        }

    }

};