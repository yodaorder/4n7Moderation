const mongoose = require("mongoose");


const GuildSettingsSchema = new mongoose.Schema({

    guildID: {
        type: String,
        required: true,
        unique: true
    },


    logChannelID: {
        type: String,
        default: null
    },


    welcomeChannelID: {
        type: String,
        default: null
    },


    goodbyeChannelID: {
        type: String,
        default: null
    },


    welcomeMessage: {
        type: String,
        default: "Welcome {user}!"
    },


    goodbyeMessage: {
        type: String,
        default: "{user} left the server."
    },


    modRoles: {
        type: Array,
        default: [
            "1487658551982690434",
            "1424488383144661012",
            "1545278987289239632",
            "1428810394872582164",
        ]
    },


    adminRoles: {
        type: Array,
        default: [
            "1530026478748831875",
            "1553538275669577799",
            "1555410011771904000",
            "1546977481737895997",
            "1546549484907929620",
            "1554210104612491265",
            "1424495241745924296",
            "1487630265344983091",
            "1424488974822539335"
        ]
    },


    ignoredChannels: {
        type: Array,
        default: []
    },


    trustedUsers: {
        type: Array,
        default: []
    },


    autoMod: {

        enabled: {
            type: Boolean,
            default: false
        },

        antiSpam: {
            type: Boolean,
            default: false
        },

        antiLinks: {
            type: Boolean,
            default: false
        },

        antiInvites: {
            type: Boolean,
            default: false
        },

        allowLinks: {
            type: Boolean,
            default: false
        },

        allowInvites: {
            type: Boolean,
            default: false
        }

    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});


module.exports =
mongoose.model(
    "GuildSettings",
    GuildSettingsSchema
);