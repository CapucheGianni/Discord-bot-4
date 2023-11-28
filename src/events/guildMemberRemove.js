const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(client, member) {
        try {
            const { guild, user } = member;
            const channel = await client.prisma.leaveChannel.findUnique({
                where: {
                    serverId: guild.id
                }
            });
            const embed = new EmbedBuilder();

            if (!channel || !channel.isActivated || channel.name === "default") {
                return;
            }
            embed.setTitle(`Goodbye ${user.username}.`)
                .setDescription(channel.leaveMessage)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `ID: ${user.id} | ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setColor("DarkBlue");
            await client.channels.cache.get(channel.id).send({ embeds: [ embed ] });
        } catch (e) {
            console.log(e);
        }
    }
};