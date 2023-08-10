const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
let check = 0;
const infos = {
    oldGame: ""
};
const { twitch } = require("../../settings.json");

const getTwitchAccessToken = async () => {
    const twitchAPIURL = 'https://id.twitch.tv/oauth2/token';
    const params = {
        client_id: twitch.TWITCH_CLIENT_ID,
        client_secret: twitch.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
    };

    try {
        const response = await axios.post(twitchAPIURL, null, { params });
        const { data } = response;

        return data.access_token;
    } catch (e) {
        console.log(e);
    }
}

const setEmbed = (client, title, viewer_count, game_name) => {
    const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitch.TWITCH_USER_LOGIN}-1920x1080.jpg?cacheBypass=${Date.now()}`)
        .addFields(
            {
                name: 'Viewers',
                value: `${viewer_count}`,
                inline: true
            },
            {
                name: 'Lien',
                value: `https://twitch.tv/${twitch.TWITCH_USER_LOGIN}`,
                inline: true
            },
            {
                name: 'Jeu',
                value: `${game_name}`,
                inline: true
            }
        )
        .setFooter({
            text: `Stream de ${twitch.TWITCH_USER_LOGIN} | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setColor(`#6441a5`);

    return embed;
};

const sendMessage = async (client, content, embed) => {
    await client.channels.cache.get("1121226924082077747").send({
        content: content,
        embeds: [ embed ],
        allowedMentions: { parse: [ 'everyone' ] }
    });
};

const getTwitchStream = async (client) => {
    const twitchAccessToken = await getTwitchAccessToken();
    const twitchAPIURL = 'https://api.twitch.tv/helix/streams';
    const params = { user_login: twitch.TWITCH_USER_LOGIN };
    const headers = {
        'Client-ID': twitch.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
    };

    setInterval(async () => {
        try {
            const response = await axios.get(twitchAPIURL, {
                params,
                headers
            });
            const { data } = response;

            if (data.data.length) {
                const { title, viewer_count, game_name } = data.data[ 0 ];
                const embed = setEmbed(client, title, viewer_count, game_name);

                if (check === 1) {
                    if (game_name !== infos.oldGame && check === 1) {
                        await sendMessage(client, `Changement de plan, **${twitch.TWITCH_USER_LOGIN}** joue maintenant à __${game_name}__!`, embed);
                        infos.oldGame = game_name;
                    }
                    return;
                }
                check = 1;
                await sendMessage(client, `Coucou @everyone! **${twitch.TWITCH_USER_LOGIN}** est en live sur Twitch!`, embed);
                infos.oldGame = game_name;
            } else {
                infos.oldGame = "";
                check = 0;
            }
        } catch (e) {
            console.log(e);
        }
    }, 1000 * 60 * 5);
};

module.exports = getTwitchStream;