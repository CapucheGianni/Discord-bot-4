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
            .setDescription(`**Auteur:** ${message.author} (${message.author.id})\n**Salon:** ${message.channel} (${message.channel.id})\n**Serveur:** ${message.guild} (${message.guild.id})\n**Message:** ${message.content}`)
            .setFooter({
                text: `Message supprimé par ${message.author.username} | ${client.user.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ff0000`);
        await client.channels.cache.get("1121226924082077747").send({
            embeds: [embed]
        });
    }
};