const mongoose = require("mongoose");



const SnipeMessagesSchema =
new mongoose.Schema({



    guildID: {

        type: String,

        required: true

    },



    channelID: {

        type: String,

        required: true

    },



    messageID: {

        type: String,

        required: true

    },



    userID: {

        type: String,

        required: true

    },



    type: {

        type: String,

        enum:[
            "DELETE",
            "EDIT",
            "REACTION"
        ],

        default:"DELETE"

    },



    content: {

        type: String,

        default:null

    },



    oldContent: {

        type: String,

        default:null

    },



    newContent: {

        type: String,

        default:null

    },



    reaction: {

        type:String,

        default:null

    },



    createdAt: {

        type: Date,

        default: Date.now

    }



});



module.exports =
mongoose.model(
    "SnipeMessages",
    SnipeMessagesSchema
);