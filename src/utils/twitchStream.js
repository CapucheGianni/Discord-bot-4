const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
let check = 0;
require('dotenv').config();

const getTwitchAccessToken = async () => {
    const twitchAPIURL = 'https://id.twitch.tv/oauth2/token';
    const params = {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_SECRET,
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
        user_login: process.env.TWITCH_USER_LOGIN
    };
    const headers = {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
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
                    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${process.env.TWITCH_USER_LOGIN}-1920x1080.jpg?cacheBypass=${Date.now()}`)
                    .addFields(
                        {
                            name: 'Viewers',
                            value: `${viewer_count}`,
                            inline: true
                        },
                        {
                            name: 'Lien',
                            value: `https://twitch.tv/${process.env.TWITCH_USER_LOGIN}`,
                            inline: true
                        },
                        {
                            name: 'Jeu',
                            value: `${game_name}`,
                            inline: true
                        }
                    )
                    .setFooter({
                        text: `Stream de ${process.env.TWITCH_USER_LOGIN} | ${client.user.username}`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp()
                    .setColor(`#6441a5`)

                if (check === 1)
                    return;
                check = 1;
                await client.channels.cache.get("1137739326822826065").send({
                    content: `Coucou @everyone! **${process.env.TWITCH_USER_LOGIN}** est en live sur Twitch !`,
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
    }, 1000 * 30);
};

module.exports = getTwitchStream;