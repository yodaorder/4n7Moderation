const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");


const fs =
require("fs");


const path =
require("path");


require("dotenv").config();



const {
    connectDatabase
} = require("./database");




// Create client

const client =
new Client({

    intents:[

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildMessageReactions

    ]

});





// Command collection

client.commands =
new Collection();




// Load commands

const commandsPath =
path.join(

    __dirname,

    "commands"

);



const commandFolders =
fs.readdirSync(
    commandsPath
);



for(
    const folder of commandFolders
){


    const folderPath =
    path.join(

        commandsPath,

        folder

    );



    if(
        !fs.statSync(folderPath).isDirectory()
    ){

        continue;

    }



    const commandFiles =
    fs.readdirSync(folderPath)
    .filter(

        file =>
        file.endsWith(".js")

    );



    for(
        const file of commandFiles
    ){


        const command =
        require(

            path.join(

                folderPath,

                file

            )

        );



        if(
            command.data &&
            command.execute
        ){


            client.commands.set(

                command.data.name,

                command

            );


            console.log(

                `Loaded command: ${command.data.name}`

            );


        }


    }


}






// Load events

const eventsPath =
path.join(

    __dirname,

    "events"

);



const eventFiles =
fs.readdirSync(eventsPath)
.filter(

    file =>
    file.endsWith(".js")

);



for(
    const file of eventFiles
){



    const event =
    require(

        path.join(

            eventsPath,

            file

        )

    );



    if(
        event.once
    ){


        client.once(

            event.name,

            (...args)=>

            event.execute(
                ...args
            )

        );


    } else {


        client.on(

            event.name,

            (...args)=>

            event.execute(
                ...args
            )

        );


    }



    console.log(

        `Loaded event: ${event.name}`

    );


}







// Start bot

async function start(){


    await connectDatabase();



    await client.login(

        process.env.TOKEN

    );


}



start();