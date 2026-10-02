const {
    REST,
    Routes
} = require("discord.js");


const fs = require("fs");
const path = require("path");


require("dotenv").config();



const commands = [];



const commandsPath =
path.join(
    __dirname,
    "commands"
);



const commandFolders =
fs.readdirSync(commandsPath);



for (const folder of commandFolders) {


    const folderPath =
    path.join(
        commandsPath,
        folder
    );


    if (!fs.statSync(folderPath).isDirectory()) {
        continue;
    }



    const commandFiles =
    fs.readdirSync(folderPath)
    .filter(file =>
        file.endsWith(".js")
    );



    for (const file of commandFiles) {


        const command =
        require(
            path.join(
                folderPath,
                file
            )
        );



        if (
            command.data &&
            command.execute
        ) {

            commands.push(
                command.data.toJSON()
            );

            console.log(
                `Loaded command: ${command.data.name}`
            );

        }

    }

}



const rest =
new REST({

    version:"10"

}).setToken(

    process.env.TOKEN

);



async function deploy(){


    try {


        console.log(
            `Deploying ${commands.length} commands...`
        );



        await rest.put(

            Routes.applicationGuildCommands(

                process.env.CLIENT_ID,

                process.env.GUILD_ID

            ),

            {

                body: commands

            }

        );



        console.log(
            "✅ Commands deployed successfully."
        );



    } catch(error){


        console.error(error);


    }


}



deploy();