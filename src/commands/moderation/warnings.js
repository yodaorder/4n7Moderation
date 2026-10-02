const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const {
    isModerator
} = require("../../systems/permissions");

const UserWarnings =
    require("../../database/models/UserWarnings");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("View and manage a user's warnings")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User whose warnings you want to view")
                .setRequired(true)
        ),


    async execute(interaction) {

        if (!(await isModerator(interaction.member))) {

            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });

        }


        const user =
            interaction.options.getUser("user");


        let warnings =
            await UserWarnings.find({

                guildID:
                    interaction.guild.id,

                userID:
                    user.id

            }).sort({

                createdAt: -1

            });


        if (!warnings.length) {

            return interaction.reply({
                content:
                    `✅ <@${user.id}> has no warnings.`,
                ephemeral: true
            });

        }


        const perPage = 5;

        let page = 0;


        function totalPages() {

            return Math.max(
                1,
                Math.ceil(warnings.length / perPage)
            );

        }


        function getCurrentWarnings() {

            const start =
                page * perPage;

            return warnings.slice(
                start,
                start + perPage
            );

        }


        function createEmbed() {

            const current =
                getCurrentWarnings();

            const start =
                page * perPage;


            return new EmbedBuilder()

                .setTitle(
                    `⚠️ Warnings for ${user.tag}`
                )

                .setDescription(

                    current.map((warning, index) => {

                        return (
                            `**#${start + index + 1}**\n` +
                            `**Reason:** ${warning.reason}\n` +
                            `**Moderator:** <@${warning.moderatorID}>\n` +
                            `**Warning ID:** \`${warning._id}\`\n` +
                            `**Date:** <t:${Math.floor(warning.createdAt.getTime() / 1000)}:R>`
                        );

                    }).join("\n\n")

                )

                .setFooter({

                    text:
                        `Page ${page + 1}/${totalPages()} • ${warnings.length} total warning(s)`

                })

                .setTimestamp();

        }


        function createSelectMenu() {

            const current =
                getCurrentWarnings();

            const start =
                page * perPage;


            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(
                        "remove_warning"
                    )

                    .setPlaceholder(
                        "Select a warning to remove"
                    )

                    .addOptions(

                        current.map((warning, index) => {

                            return {

                                label:
                                    `Remove Warning #${start + index + 1}`,

                                description:
                                    String(warning.reason)
                                        .slice(0, 100),

                                value:
                                    warning._id.toString()

                            };

                        })

                    );


            return new ActionRowBuilder()
                .addComponents(menu);

        }


        function createButtons() {

            return new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()
                        .setCustomId("previous_page")
                        .setLabel("Previous")
                        .setEmoji("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),

                    new ButtonBuilder()
                        .setCustomId("next_page")
                        .setLabel("Next")
                        .setEmoji("➡️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(
                            page >= totalPages() - 1
                        )

                );

        }


        const response =
            await interaction.reply({

                embeds: [
                    createEmbed()
                ],

                components: [

                    createSelectMenu(),

                    createButtons()

                ],

                fetchReply: true

            });


        const collector =
            response.createMessageComponentCollector({

                time:
                    120000

            });


        collector.on(
            "collect",
            async component => {

                if (
                    component.user.id !==
                    interaction.user.id
                ) {

                    return component.reply({

                        content:
                            "❌ You cannot control this warning menu.",

                        ephemeral: true

                    });

                }


                if (
                    component.isStringSelectMenu()
                ) {

                    const warningID =
                        component.values[0];


                    await UserWarnings.deleteOne({

                        _id:
                            warningID,

                        guildID:
                            interaction.guild.id,

                        userID:
                            user.id

                    });


                    warnings =
                        await UserWarnings.find({

                            guildID:
                                interaction.guild.id,

                            userID:
                                user.id

                        }).sort({

                            createdAt:
                                -1

                        });


                    if (!warnings.length) {

                        collector.stop(
                            "empty"
                        );


                        return component.update({

                            content:
                                `✅ All warnings for <@${user.id}> have been removed.`,

                            embeds: [],

                            components: []

                        });

                    }


                    if (
                        page >= totalPages()
                    ) {

                        page =
                            totalPages() - 1;

                    }


                    return component.update({

                        embeds: [
                            createEmbed()
                        ],

                        components: [

                            createSelectMenu(),

                            createButtons()

                        ]

                    });

                }


                if (
                    component.customId ===
                    "previous_page"
                ) {

                    if (page > 0) {
                        page--;
                    }

                }


                if (
                    component.customId ===
                    "next_page"
                ) {

                    if (
                        page < totalPages() - 1
                    ) {

                        page++;

                    }

                }


                await component.update({

                    embeds: [
                        createEmbed()
                    ],

                    components: [

                        createSelectMenu(),

                        createButtons()

                    ]

                });

            }
        );


        collector.on(
            "end",
            async () => {

                if (warnings.length === 0) {
                    return;
                }


                const disabledSelect =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            "remove_warning_disabled"
                        )

                        .setPlaceholder(
                            "Warning menu expired"
                        )

                        .setDisabled(true)

                        .addOptions({

                            label: "Menu expired",
                            description: "Run /warnings again",
                            value: "expired"

                        });


                const disabledSelectRow =
                    new ActionRowBuilder()
                        .addComponents(
                            disabledSelect
                        );


                const disabledButtons =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId("previous_disabled")
                                .setLabel("Previous")
                                .setEmoji("⬅️")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),

                            new ButtonBuilder()
                                .setCustomId("next_disabled")
                                .setLabel("Next")
                                .setEmoji("➡️")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)

                        );


                await response.edit({

                    components: [

                        disabledSelectRow,

                        disabledButtons

                    ]

                }).catch(() => {});

            }
        );

    }

};