const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { twitch } = require("../../settings.json");
require('dotenv').config();
const { prisma } = require('../db/main.js');

const getTwitchAccessToken = async (error) => {
    const twitchAPIURL = 'https://id.twitch.tv/oauth2/token';
    const params = {
        client_id: twitch.TWITCH_CLIENT_ID,
        client_secret: twitch.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
    };
    const oldToken = await prisma.twitch.findMany();

    try {
        if (oldToken.length && !error) return oldToken[0].token;

        const response = await axios.post(twitchAPIURL, null, { params });
        const { data } = response;

        const newToken = await prisma.twitch.upsert({
            where: { id: '1' },
            update: { token: data.access_token },
            create: { token: data.access_token }
        });
        return newToken.token;
    } catch (e) {
        console.log(e);
    }
}

const setEmbed = (client, data) => {
    const { title, viewer_count, game_name, user_login, user_name, tags } = data;

    return new EmbedBuilder()
        .setTitle(title)
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${user_login}-1920x1080.jpg?cacheBypass=${Date.now()}`)
        .addFields(
            {
                name: 'Viewers',
                value: `${viewer_count}`,
                inline: true
            },
            {
                name: 'Lien',
                value: `https://twitch.tv/${user_login}`,
                inline: true
            },
            {
                name: 'Jeu',
                value: `${game_name}`,
                inline: true
            },
            {
                name: 'Tags',
                value: tags.join(' / ') || 'Aucun tag configuré',
            }
        )
        .setFooter({
            text: `${user_name} est en live | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setColor(`#6441a5`);
};

const sendMessage = async (client, infos, embed, message, isUpdate) => {
    const mention = infos.roleId ? `<@&${infos.roleId}>` : null;
    let finalMessage = message?.replace('{streamer}', infos.streamer);

    if (mention && !isUpdate) finalMessage = `||${mention}||\n\n${finalMessage}`;
    await client.channels.cache.get(infos.channelId).send({
        content: finalMessage,
        embeds: [embed],
        allowedMentions: { parse: ['roles'] }
    });
};

const sendTwitchEmbed = async (client, params, headers, infos) => {
    const TWITCH_API_URL = 'https://api.twitch.tv/helix/streams';
    const response = await axios.get(TWITCH_API_URL, {
        params,
        headers
    });
    const { data } = response;

    if (!infos.id) return;
    if (data.data.length) {
        const embed = setEmbed(client, data.data[0], infos);

        if (!infos.isStreaming) {
            await sendMessage(client, infos, embed, infos.message, false);
        } else {
            if (infos.title !== data.data[0].title) await sendMessage(client, infos, embed, infos.updateMessage, true);
            else return;
        }
        if (infos.id) {
            await prisma.twitchNotification.update({
                where: { id: infos.id },
                data: {
                    isStreaming: true,
                    title: data.data[0].title,
                }
            });
        }
    } else {
        if (infos.id) {
            await prisma.twitchNotification.update({
                where: { id: infos.id },
                data: {
                    isStreaming: false,
                    title: null
                }
            });
        }
    }
}

const getTwitchStream = async (client) => {
    let twitchAccessToken = await getTwitchAccessToken(false);
    const headers = {
        'Client-ID': twitch.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
    };

    await setStreamStatusOnStart();
    setInterval(async () => {
        const streamers = await prisma.twitchNotification.findMany();

        streamers.forEach(async (streamer) => {
            const params = { user_login: streamer.streamer.toLowerCase() };

            try {
                await sendTwitchEmbed(client, params, headers, streamer);
            } catch (e) {
                try {
                    twitchAccessToken = await getTwitchAccessToken(true);

                    headers.Authorization = `Bearer ${twitchAccessToken}`;
                    await sendTwitchEmbed(client, params, headers, streamer);
                } catch (err) {
                    console.log(err);
                }
            }
        });
    }, 1000 * 60 * 10);
};

const setStreamStatusOnStart = async () => {
    await prisma.twitchNotification.updateMany({
        data: {
            isStreaming: false,
            title: null
        }
    });
}

module.exports = getTwitchStream;