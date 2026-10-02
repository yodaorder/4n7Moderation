const SnipeMessages =
require("../database/models/SnipeMessages");



module.exports = {


    name:"messageDelete",



    async execute(message){



        if(
            !message.guild ||
            message.author?.bot
        ){

            return;

        }



        await SnipeMessages.create({


            guildID:
            message.guild.id,


            channelID:
            message.channel.id,


            messageID:
            message.id,


            userID:
            message.author.id,


            type:
            "DELETE",


            content:
            message.content


        });



    }


};