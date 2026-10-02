const GuildSettings =
require("../database/models/GuildSettings");



async function getConfig(guildID) {


    let config =
    await GuildSettings.findOne({

        guildID

    });



    if(!config) {


        config =
        await GuildSettings.create({

            guildID,

            modRoles:[],

            adminRoles:[],

            autoMod:{

                enabled:false,

                antiSpam:false,

                antiLinks:false,

                antiInvites:false

            }

        });


    }



    return config;


}





async function updateConfig(
    guildID,
    data
) {


    return await GuildSettings.findOneAndUpdate(

        {
            guildID
        },

        data,

        {
            new:true,
            upsert:true
        }

    );


}





module.exports = {

    getConfig,

    updateConfig

};