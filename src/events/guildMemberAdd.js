const GuildSettings =
require("../database/models/GuildSettings");


const {
    handleJoin
} = require("../systems/automod");



module.exports = {


    name:"guildMemberAdd",



    async execute(member){


        // AutoMod raid detector

        await handleJoin(
            member
        );



        const settings =
        await GuildSettings.findOne({

            guildID:
            member.guild.id

        });



        if(
            !settings ||
            !settings.welcomeChannelID
        ){

            return;

        }



        const channel =
        member.guild.channels.cache.get(

            settings.welcomeChannelID

        );



        if(!channel)
            return;



        const msg =
        settings.welcomeMessage
        .replace(

            "{user}",

            `<@${member.id}>`

        )
        .replace(

            "{server}",

            member.guild.name

        );



        await channel.send({

            content:
            msg

        });


    }


};