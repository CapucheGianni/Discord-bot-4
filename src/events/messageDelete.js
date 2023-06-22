const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(client, message) {
        if (!message.guild)
            return;
        if (message.guild.id !== "832753902943207454")
            return;

        const embed = new EmbedBuilder()
            .setTitle("Message supprimé 🗑️")
            .setDescription(`**Auteur:** ${message.author}\n**Salon:** ${message.channel}\n**Message:** ${message.content}`)
            .setFooter({
                text: `Message supprimé par ${message.author.username} | ${client.user.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ff0000`);
        await client.channels.cache.get("873663564135690352").send({
            embeds: [embed]
        });
    }
};