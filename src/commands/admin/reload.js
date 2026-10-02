const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");


module.exports = {


data: new SlashCommandBuilder()

    .setName("reload")

    .setDescription(
        "Reload a bot command"
    )

    .addStringOption(option =>
        option
        .setName("command")
        .setDescription(
            "Command name to reload"
        )
        .setRequired(true)
    ),



async execute(interaction){


    const ownerID =
    process.env.OWNER_ID;



    if(
        interaction.user.id !== ownerID
    ){

        return interaction.reply({

            content:
            "❌ You do not have permission to use this command.",

            ephemeral:true

        });

    }



    const commandName =
    interaction.options.getString(
        "command"
    );



    const command =
    interaction.client.commands.get(
        commandName
    );



    if(!command){

        return interaction.reply({

            content:
            "❌ Command not found.",

            ephemeral:true

        });

    }



    try{


        delete require.cache[
            require.resolve(
                `../${command.data.name}.js`
            )
        ];



        interaction.reply({

            content:
            `✅ Reloaded **/${commandName}**`

        });



    }catch(error){


        console.error(error);


        interaction.reply({

            content:
            "❌ Failed to reload command.",

            ephemeral:true

        });


    }


}


};