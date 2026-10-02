const mongoose = require("mongoose");

require("dotenv").config();



async function connectDatabase() {

    try {


        await mongoose.connect(
            process.env.MONGO_URI
        );


        console.log(
            "✅ MongoDB connected successfully."
        );


    } catch (error) {


        console.error(
            "❌ MongoDB connection failed:"
        );


        console.error(error);


        process.exit(1);


    }

}



module.exports = {

    connectDatabase

};