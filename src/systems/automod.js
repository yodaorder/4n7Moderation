const GuildSettings = require("../database/models/GuildSettings");
const { log } = require("./logger");

const spamCache = new Map();
const joinCache = new Map();

const BAD_WORDS = [
    "badword1",
    "badword2"
];

const BLOCKED_EXTENSIONS = [
    ".exe",
    ".bat",
    ".scr",
    ".cmd"
];


function cleanText(text) {

    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, "");

}



function isCapsSpam(text) {

    if(text.length < 8)
        return false;


    const letters =
    text.replace(/[^a-zA-Z]/g,"");


    if(!letters.length)
        return false;


    return (
        letters === letters.toUpperCase()
        &&
        letters.length > 8
    );

}



function containsBadWord(text) {

    const clean =
    cleanText(text);


    return BAD_WORDS.some(word =>
        clean.includes(word)
    );

}



function detectSpam(message) {


    const id =
    message.author.id;


    if(!spamCache.has(id)) {

        spamCache.set(id, []);

    }


    const messages =
    spamCache.get(id);


    messages.push({

        content:
        message.content,

        time:
        Date.now()

    });



    const recent =
    messages.filter(x =>
        Date.now() - x.time < 5000
    );


    spamCache.set(
        id,
        recent
    );


    if(recent.length >= 6)
        return 40;



    const duplicates =
    recent.filter(x =>
        x.content === message.content
    );


    if(duplicates.length >= 3)
        return 30;


    return 0;

}




function detectLinks(content, settings) {


    let score = 0;



    if(
        content.includes("discord.gg")
        &&
        !settings.autoMod.allowInvites
    ) {

        score += 50;

    }



    if(
        /(https?:\/\/)/i.test(content)
        &&
        !settings.autoMod.allowLinks
    ) {

        score += 30;

    }



    if(
        /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(content)
    ) {

        score += 40;

    }



    return score;

}





function detectMentions(message) {


    let score = 0;



    if(
        message.mentions.everyone
        ||
        message.mentions.here
    ) {

        score += 60;

    }



    if(
        message.mentions.users.size > 5
    ) {

        score += 30;

    }



    if(
        message.mentions.roles.size > 3
    ) {

        score += 30;

    }



    return score;

}





function detectAttachments(message) {


    let score = 0;



    for(
        const file of message.attachments.values()
    ) {


        const name =
        file.name.toLowerCase();


        for(
            const ext of BLOCKED_EXTENSIONS
        ) {


            if(name.endsWith(ext)) {

                score += 80;

            }

        }

    }


    return score;

}





async function punish(
    message,
    score,
    reason
) {


    const member =
    message.member;



    await message.delete()
    .catch(()=>{});



    if(score >= 90) {


        await member.ban({

            reason:
            `AutoMod: ${reason}`

        })
        .catch(()=>{});


        await log(

            message.guild,

            "AUTOMOD BAN",

            member.id,

            null,

            reason

        );


        return;

    }





    if(score >= 60) {


        await member.timeout(

            60 * 60 * 1000,

            `AutoMod: ${reason}`

        )
        .catch(()=>{});



        await log(

            message.guild,

            "AUTOMOD TIMEOUT",

            member.id,

            null,

            reason

        );


        return;

    }





    if(score >= 30) {


        await log(

            message.guild,

            "AUTOMOD WARNING",

            member.id,

            null,

            reason

        );


        await message.channel.send({

            content:
            `<@${member.id}> warning: ${reason}`

        });


    }


}





async function handleMessage(message) {


    if(
        !message.guild
        ||
        message.author.bot
    )
        return;



    const settings =
    await GuildSettings.findOne({

        guildID:
        message.guild.id

    });



    if(
        !settings
        ||
        !settings.autoMod?.enabled
    )
        return;



    if(
        settings.ignoredChannels?.includes(
            message.channel.id
        )
    )
        return;



    if(
        message.member.permissions.has(
            "Administrator"
        )
    )
        return;



    let score = 0;

    let reason = [];



    if(isCapsSpam(message.content)) {

        score += 20;

        reason.push(
            "Caps spam"
        );

    }



    if(containsBadWord(message.content)) {

        score += 70;

        reason.push(
            "Bad word"
        );

    }



    score += detectSpam(message);

    if(score)
        reason.push(
            "Spam"
        );



    const linkScore =
    detectLinks(
        message.content,
        settings
    );


    if(linkScore) {

        score += linkScore;

        reason.push(
            "Links"
        );

    }



    const mentionScore =
    detectMentions(message);


    if(mentionScore) {

        score += mentionScore;

        reason.push(
            "Mention abuse"
        );

    }



    const fileScore =
    detectAttachments(message);


    if(fileScore) {

        score += fileScore;

        reason.push(
            "Blocked file"
        );

    }



    if(score > 0) {


        await punish(

            message,

            score,

            reason.join(", ")

        );


    }


}





async function handleJoin(member) {


    const guild =
    member.guild.id;



    if(!joinCache.has(guild)) {

        joinCache.set(
            guild,
            []
        );

    }



    const joins =
    joinCache.get(guild);


    joins.push(
        Date.now()
    );



    const recent =
    joins.filter(time =>
        Date.now() - time < 10000
    );



    joinCache.set(
        guild,
        recent
    );



    if(recent.length >= 15) {


        await log(

            member.guild,

            "AUTOMOD RAID DETECTION",

            member.id,

            null,

            "Mass join detected"

        );


    }


}



module.exports = {

    handleMessage,

    handleJoin

};