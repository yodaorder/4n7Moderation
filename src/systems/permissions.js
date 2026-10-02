const GuildSettings =
require("../database/models/GuildSettings");



async function isOwner(member) {


    return (
        member.id ===
        process.env.OWNER_ID
    );


}



async function getGuildSettings(guildID) {


    return await GuildSettings.findOne({

        guildID

    });


}



async function isAdmin(member) {


    // Bot owner bypass

    if(
        await isOwner(member)
    ) {

        return true;

    }



    // Discord Administrator permission

    if(
        member.permissions.has(
            "Administrator"
        )
    ) {

        return true;

    }



    const settings =
    await getGuildSettings(
        member.guild.id
    );



    if(
        !settings
    ) {

        return false;

    }



    return member.roles.cache.some(
        role =>
        settings.adminRoles.includes(
            role.id
        )
    );


}



async function isModerator(member) {


    // Admins can moderate

    if(
        await isAdmin(member)
    ) {

        return true;

    }



    const settings =
    await getGuildSettings(
        member.guild.id
    );



    if(
        !settings
    ) {

        return false;

    }



    return member.roles.cache.some(
        role =>
        settings.modRoles.includes(
            role.id
        )
    );


}



async function canModerate(
    moderator,
    target
) {


    if(
        await isOwner(moderator)
    ) {

        return true;

    }



    if(
        target.id === moderator.id
    ) {

        return false;

    }



    if(
        target.roles.highest.position >=
        moderator.roles.highest.position
    ) {

        return false;

    }



    return true;


}



module.exports = {


    isOwner,

    isAdmin,

    isModerator,

    canModerate


};