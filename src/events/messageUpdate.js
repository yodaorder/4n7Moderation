const SnipeMessages =
require("../database/models/SnipeMessages");



module.exports = {


    name:"messageUpdate",



    async execute(
        oldMessage,
        newMessage
    ){



        if(
            !oldMessage.guild ||
            oldMessage.author?.bot
        ){

            return;

        }



        if(
            oldMessage.content ===
            newMessage.content
        ){

            return;

        }



        await SnipeMessages.create({


            guildID:
            oldMessage.guild.id,


            channelID:
            oldMessage.channel.id,


            messageID:
            oldMessage.id,


            userID:
            oldMessage.author.id,


            type:
            "EDIT",


            oldContent:
            oldMessage.content,


            newContent:
            newMessage.content



        });



    }


};