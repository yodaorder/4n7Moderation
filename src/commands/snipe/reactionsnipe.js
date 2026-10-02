const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const SnipeMessages = require("../../database/models/SnipeMessages");


module.exports = {


    data:new SlashCommandBuilder()

        .setName("reactionsnipe")

        .setDescription(
            "Shows the last removed reaction"
        ),



    async execute(interaction){



        const data =
        await SnipeMessages.findOne({

            guildID:
            interaction.guild.id,


            channelID:
            interaction.channel.id,


            type:
            "REACTION"


        })
        .sort({

            createdAt:-1

        });




        if(!data){


            return interaction.reply({

                content:
                "❌ No removed reactions found.",

                ephemeral:true

            });


        }




        const embed =
        new EmbedBuilder()


        .setTitle(
            "🕵️ Reaction Snipe"
        )


        .addFields(

            {

                name:"User",

                value:
                `<@${data.userID}>`

            },


            {

                name:"Reaction",

                value:
                data.reaction || "Unknown"

            },


            {

                name:"Message ID",

                value:
                data.messageID || "Unknown"

            }


        )


        .setTimestamp(
            data.createdAt
        );




        await interaction.reply({

            embeds:[
                embed
            ]

        });



    }


};