const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("help")

        .setDescription(
            "Shows all available commands"
        ),



    async execute(interaction){


        const commands =
        interaction.client.commands;


        const commandList =
        commands.map(command => {

            return `</${command.data.name}:${command.data.id || ""}>`;

        }).join("\n");



        const embed =
        new EmbedBuilder()

        .setTitle("📚 Commands")

        .setDescription(
            commandList || "No commands loaded."
        )

        .setFooter({

            text:
            `${commands.size} commands available`

        })

        .setTimestamp();



        await interaction.reply({

            embeds:[
                embed
            ],

            ephemeral:true

        });


    }

};