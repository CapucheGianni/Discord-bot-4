const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
let check = 0;
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

const getTwitchStream = async (client) => {
    const twitchAccessToken = await getTwitchAccessToken();
    const twitchAPIURL = 'https://api.twitch.tv/helix/streams';
    const params = {
        user_login: twitch.TWITCH_USER_LOGIN
    };
    const headers = {
        'Client-ID': twitch.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
    };

    setInterval(async () => {
        try {
            const response = await axios.get(twitchAPIURL, { params, headers });
            const { data } = response;

            if (data.data.length) {
                const { title, viewer_count, game_name } = data.data[0];
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
                    .setColor(`#6441a5`)

                if (check === 1)
                    return;
                check = 1;
                await client.channels.cache.get("1137739326822826065").send({
                    content: `Coucou @everyone! **${twitch.TWITCH_USER_LOGIN}** est en live sur Twitch !`,
                    embeds: [embed],
                    allowedMentions: {
                        parse: ['everyone']
                    }
                });
            } else {
                check = 0;
            }
        } catch (e) {
            console.log(e);
        }
    }, 1000 * 60);
};

module.exports = getTwitchStream;