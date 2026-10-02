const {
    ActivityType
} = require("discord.js");



module.exports = {


    name:"ready",

    once:true,



    async execute(client){


        console.log(

            `✅ Logged in as ${client.user.tag}`

        );



        client.user.setActivity(

            `${client.guilds.cache.size} servers`,

            {

                type:
                ActivityType.Watching

            }

        );


    }


};