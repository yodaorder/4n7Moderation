const mongoose = require("mongoose");


const UserWarningsSchema = new mongoose.Schema({

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

    reason: {
        type: String,
        default: "No reason provided"
    },

    active: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "UserWarnings",
    UserWarningsSchema
);