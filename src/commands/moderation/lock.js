const {
    SlashCommandBuilder
} = require("discord.js");


const {
    isModerator
} = require("../../systems/permissions");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock the current channel"),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


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


        try {

            await interaction.channel.permissionOverwrites.edit(

                interaction.guild.roles.everyone,

                {
                    SendMessages: false
                }

            );


            await interaction.reply({
                content:
                    `🔒 <#${interaction.channel.id}> has been locked.`
            });

        } catch (error) {

            console.error("Lock error:", error);

            return interaction.reply({
                content: "❌ I could not lock this channel.",
                ephemeral: true
            });

        }

    }

};