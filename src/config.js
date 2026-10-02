require("dotenv").config();



module.exports = {


    // Bot owner

    OWNER_ID:
    process.env.OWNER_ID,



    // Discord application

    CLIENT_ID:
    process.env.CLIENT_ID,



    GUILD_ID:
    process.env.GUILD_ID,



    // Database

    MONGO_URI:
    process.env.MONGO_URI,



    // Default settings

    DEFAULT_PREFIX:
    ".",



    // AutoMod defaults

    AUTOMOD_DEFAULTS:{


        enabled:false,


        antiSpam:true,


        antiLinks:false,


        antiInvites:false,


        antiCaps:false,


        antiMentionSpam:true


    },



    // Bot information

    BOT_NAME:
    "DiscordBot",



    VERSION:
    "1.0.0"


};