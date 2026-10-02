const GuildSettings =
require("../database/models/GuildSettings");



async function getStaffRoles(guildID) {


    const settings =
    await GuildSettings.findOne({

        guildID

    });



    if(!settings) {

        return [];

    }



    return [

        ...(settings.modRoles || []),

        ...(settings.adminRoles || [])

    ];


}





async function stripRoles(member) {


    const staffRoles =
    await getStaffRoles(
        member.guild.id
    );


    const removed = [];



    for(
        const roleID of staffRoles
    ) {


        const role =
        member.roles.cache.get(
            roleID
        );


        if(role) {


            await member.roles.remove(
                role
            );


            removed.push(
                roleID
            );


        }


    }



    return removed;


}





async function addModRole(
    guildID,
    roleID
) {


    let settings =
    await GuildSettings.findOne({

        guildID

    });



    if(!settings) {


        settings =
        await GuildSettings.create({

            guildID,

            modRoles:[]

        });


    }



    if(
        !settings.modRoles.includes(roleID)
    ) {


        settings.modRoles.push(
            roleID
        );


        await settings.save();


    }


}





async function removeModRole(
    guildID,
    roleID
) {


    const settings =
    await GuildSettings.findOne({

        guildID

    });



    if(!settings) return;



    settings.modRoles =
    settings.modRoles.filter(

        id =>
        id !== roleID

    );



    await settings.save();


}





module.exports = {

    stripRoles,

    addModRole,

    removeModRole,

    getStaffRoles

};