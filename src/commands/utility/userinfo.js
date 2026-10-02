const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


module.exports = {


data: new SlashCommandBuilder()

    .setName("userinfo")

    .setDescription(
        "Shows information about a user"
    )

    .addUserOption(option =>

        option

        .setName("user")

        .setDescription(
            "User to lookup"
        )

        .setRequired(false)

    ),



async execute(interaction){


    const user =

    interaction.options.getUser("user")
    ||
    interaction.user;



    const member =

    interaction.guild.members.cache.get(
        user.id
    );



    const embed =

    new EmbedBuilder()

    .setTitle(
        "👤 User Information"
    )

    .setThumbnail(
        user.displayAvatarURL({
            dynamic:true
        })
    )

    .addFields(

        {
            name:"Username",
            value:user.tag,
            inline:true
        },

        {
            name:"User ID",
            value:user.id,
            inline:true
        },

        {
            name:"Account Created",
            value:
            `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`
        },

        {
            name:"Server Joined",
            value:
            member?.joinedTimestamp
            ?
            `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            :
            "Not found"
        }

    )

    .setTimestamp();



    await interaction.reply({

        embeds:[
            embed
        ]

    });


}


};