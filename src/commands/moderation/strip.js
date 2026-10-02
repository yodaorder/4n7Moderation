const {
    SlashCommandBuilder
} = require("discord.js");

const {
    isAdmin,
    canModerate
} = require("../../systems/permissions");

const {
    getStaffRoles
} = require("../../systems/roleManager");

const {
    log
} = require("../../systems/logger");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("strip")
        .setDescription("Remove moderation roles from a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User whose moderation roles will be removed")
                .setRequired(true)
        ),


    async execute(interaction) {

        if (!(await isAdmin(interaction.member))) {

            return interaction.reply({
                content: "❌ Only administrators can use this command.",
                ephemeral: true
            });

        }


        const user =
            interaction.options.getUser("user");


        if (user.id === interaction.guild.ownerId) {

            return interaction.reply({
                content: "❌ The server owner cannot be stripped.",
                ephemeral: true
            });

        }


        if (user.id === interaction.user.id) {

            return interaction.reply({
                content: "❌ You cannot strip yourself.",
                ephemeral: true
            });

        }


        const member =
            await interaction.guild.members.fetch(user.id)
                .catch(() => null);


        if (!member) {

            return interaction.reply({
                content: "❌ That user is not in this server.",
                ephemeral: true
            });

        }


        if (!(await canModerate(interaction.member, member))) {

            return interaction.reply({
                content: "❌ You cannot strip this user because of the role hierarchy.",
                ephemeral: true
            });

        }


        const botMember =
            interaction.guild.members.me;


        if (!botMember) {

            return interaction.reply({
                content: "❌ I could not find my server member.",
                ephemeral: true
            });

        }


        const staffRoleIDs =
            await getStaffRoles(
                interaction.guild.id
            );


        if (!staffRoleIDs.length) {

            return interaction.reply({
                content: "⚠️ No moderation roles are configured for this server.",
                ephemeral: true
            });

        }


        const removed = [];
        const skipped = [];


        for (
            const roleID of staffRoleIDs
        ) {

            const role =
                interaction.guild.roles.cache.get(
                    roleID
                );


            if (!role) {

                skipped.push(roleID);
                continue;

            }


            if (!member.roles.cache.has(roleID)) {
                continue;
            }


            if (!role.editable) {

                skipped.push(roleID);
                continue;

            }


            if (
                role.position >=
                botMember.roles.highest.position
            ) {

                skipped.push(roleID);
                continue;

            }


            if (
                role.position >=
                interaction.member.roles.highest.position
            ) {

                skipped.push(roleID);
                continue;

            }


            try {

                await member.roles.remove(
                    roleID,
                    `Role strip by ${interaction.user.id}`
                );

                removed.push(roleID);

            } catch (error) {

                console.error(
                    `Failed removing role ${roleID}:`,
                    error
                );

                skipped.push(roleID);

            }

        }


        const removedText =
            removed.length
                ? removed.map(id => `<@&${id}>`).join(", ")
                : "None";


        const skippedText =
            skipped.length
                ? skipped.map(id => `\`${id}\``).join(", ")
                : "None";


        await interaction.reply({

            content:
                `🧹 **Staff roles stripped from <@${user.id}>**\n\n` +
                `**Removed:** ${removedText}\n` +
                `**Skipped:** ${skippedText}`

        });


        if (removed.length) {

            await log(

                interaction.guild,

                "STRIP",

                user.id,

                interaction.user.id,

                `Removed role IDs: ${removed.join(", ")}`

            );

        }

    }

};