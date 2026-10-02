const {
    SlashCommandBuilder
} = require("discord.js");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("ping")

        .setDescription(
            "Check bot latency"
        ),



    async execute(interaction){


        const sent =
        await interaction.reply({

            content:
            "🏓 Checking ping...",

            fetchReply:true

        });



        const latency =
        sent.createdTimestamp -
        interaction.createdTimestamp;



        await interaction.editReply({

            content:
            `🏓 Pong!\nBot Latency: **${latency}ms**\nAPI: **${interaction.client.ws.ping}ms**`

        });


    }

};