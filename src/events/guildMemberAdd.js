const { Events, EmbedBuilder } = require('discord.js');
const { prisma } = require('../db/main.js');
require('dotenv').config();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(client, member) {
        try {
            const { guild, user } = member;
            const channel = await prisma.welcomeChannel.findUnique({
                where: {
                    serverId: guild.id
                }
            });
            const embed = new EmbedBuilder();

            if (!channel || !channel.isActivated || channel.name === "default") {
                return;
            }
            embed.setTitle(`Welcome to ${user.username}!`)
                .setDescription(channel.welcomeMessage)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `ID: ${user.id} | ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setColor(Math.floor(Math.random() * 16777215).toString(16))
            if (channel.dm) {
                user.send({ embeds: [ embed ] });
            } else {
                await client.channels.cache.get(channel.id).send({ embeds: [ embed ] });
            }
        } catch (e) {
            console.log(e);
        }
    }
};