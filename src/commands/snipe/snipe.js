const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const SnipeMessages =
require("../../database/models/SnipeMessages");


module.exports = {


data: new SlashCommandBuilder()

    .setName("snipe")

    .setDescription(
        "View the last deleted message"
    ),



async execute(interaction){


    const message =
    await SnipeMessages.findOne({

        guildID:
        interaction.guild.id,

        channelID:
        interaction.channel.id,

        edited:false

    })
    .sort({
        deletedAt:-1
    });



    if(!message){

        return interaction.reply({

            content:
            "❌ No deleted messages found.",

            ephemeral:true

        });

    }



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🕵️ Deleted Message"
    )

    .setDescription(
        message.content
        || "No content"
    )

    .addFields(

        {
            name:"User",
            value:`<@${message.userID}>`
        },

        {
            name:"User ID",
            value:message.userID
        }

    )

    .setTimestamp(
        message.deletedAt
    );



    await interaction.reply({

        embeds:[
            embed
        ]

    });


}


};