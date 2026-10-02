const {
    SlashCommandBuilder
} = require("discord.js");



module.exports = {


data: new SlashCommandBuilder()

    .setName("shutdown")

    .setDescription(
        "Shutdown the bot"
    ),




async execute(interaction){



    const ownerID =
    process.env.OWNER_ID;



    if(
        interaction.user.id !== ownerID
    ){

        return interaction.reply({

            content:
            "❌ You cannot use this command.",

            ephemeral:true

        });

    }



    await interaction.reply({

        content:
        "🛑 Shutting down bot..."

    });



    console.log(
        "Bot shutdown requested"
    );



    process.exit(0);


}


};