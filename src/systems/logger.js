const {
    EmbedBuilder
} = require("discord.js");


const ModerationLogs =
require("../database/models/ModerationLogs");


const GuildSettings =
require("../database/models/GuildSettings");



async function log(
    guild,
    action,
    userID = null,
    moderatorID = null,
    reason = "No reason provided",
    duration = null
) {


    // Save to MongoDB

    try {

        await ModerationLogs.create({

            guildID:
            guild.id,

            userID:
            userID,

            moderatorID:
            moderatorID,

            action:
            action,

            reason:
            reason,

            duration:
            duration

        });


    } catch(error) {


        console.error(
            "Failed to save moderation log:",
            error
        );


    }



    // Find log channel

    const settings =
    await GuildSettings.findOne({

        guildID:
        guild.id

    });



    if(
        !settings ||
        !settings.logChannelID
    ) {

        return;

    }



    const channel =
    guild.channels.cache.get(
        settings.logChannelID
    );



    if(!channel) {

        return;

    }



    const embed =
    new EmbedBuilder()

        .setTitle(
            `🛡️ Moderation Action: ${action}`
        )

        .addFields(

            {

                name:"User ID",

                value:
                userID
                ?
                userID
                :
                "N/A"

            },


            {

                name:"Moderator ID",

                value:
                moderatorID
                ?
                moderatorID
                :
                "N/A"

            },


            {

                name:"Reason",

                value:
                reason

            },


            {

                name:"Duration",

                value:
                duration
                ?
                duration
                :
                "N/A"

            }

        )

        .setTimestamp();



    await channel.send({

        embeds:[
            embed
        ]

    });



}



module.exports = {

    log

};