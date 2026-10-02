const mongoose = require("mongoose");



const ModerationLogsSchema =
new mongoose.Schema({



    guildID: {

        type: String,

        required: true

    },



    userID: {

        type: String,

        required: true

    },



    moderatorID: {

        type: String,

        required: true

    },



    action: {

        type: String,

        required: true

    },



    reason: {

        type: String,

        default: "No reason provided"

    },



    duration: {

        type: String,

        default: null

    },



    caseID: {

        type: Number,

        default: 1

    },



    createdAt: {

        type: Date,

        default: Date.now

    }



});



module.exports =
mongoose.model(
    "ModerationLogs",
    ModerationLogsSchema
);