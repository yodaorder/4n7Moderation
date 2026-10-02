const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const SnipeMessages = require("../../database/models/SnipeMessages");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("editsnipe")

        .setDescription(
            "Shows the last edited message in this channel"
        ),


    async execute(interaction) {


        const data = await SnipeMessages.findOne({

            guildID:
            interaction.guild.id,

            channelID:
            interaction.channel.id,

            type:
            "EDIT"

        })
        .sort({
            createdAt:-1
        });



        if(!data){


            return interaction.reply({

                content:
                "❌ No edited messages found.",

                ephemeral:true

            });


        }



        const embed = new EmbedBuilder()

            .setTitle("✏️ Edited Message")

            .addFields(

                {
                    name:"User",
                    value:`<@${data.userID}>`
                },

                {
                    name:"Before",
                    value:data.oldContent || "No content"
                },

                {
                    name:"After",
                    value:data.newContent || "No content"
                }

            )

            .setTimestamp(data.createdAt);



        await interaction.reply({

            embeds:[
                embed
            ]

        });


    }

};