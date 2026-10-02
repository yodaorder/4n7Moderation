const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


module.exports = {


data:new SlashCommandBuilder()

    .setName("avatar")

    .setDescription(
        "Shows a user's avatar"
    )

    .addUserOption(option =>

        option

        .setName("user")

        .setDescription(
            "User avatar to view"
        )

        .setRequired(false)

    ),



async execute(interaction){


    const user =

    interaction.options.getUser("user")
    ||
    interaction.user;



    const embed =

    new EmbedBuilder()

    .setTitle(
        `${user.tag}'s Avatar`
    )

    .setImage(
        user.displayAvatarURL({
            size:4096,
            dynamic:true
        })
    )

    .setTimestamp();



    await interaction.reply({

        embeds:[
            embed
        ]

    });


}


};