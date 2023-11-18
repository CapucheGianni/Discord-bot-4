const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(client, member) {
        try {
            const { guild, user } = member;
            const fetchedUser = await user.fetch();
            const channel = await client.prisma.welcomeChannel.findUnique({
                where: {
                    serverId: guild.id
                }
            });
            const embed = new EmbedBuilder();

            if (!channel || !channel.isActivated) {
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
                .setColor(fetchedUser.hexAccentColor || "#000")
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