const { EmbedBuilder } = require('discord.js');

const commandErrorLog = (client, error, cmd) => {
    const embed = new EmbedBuilder()
        .setTitle(`Error in command ${cmd.name}`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({
            text: `Commande exécutée par ${cmd.author.username} | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setColor('#ff0000')
        .setTimestamp()

    client.channels.cache.get('1121226924082077747').send({ embeds: [ embed ] })
}

const interactionErrorLog = (client, error, int) => {
    const embed = new EmbedBuilder()
        .setTitle(`Error in command ${int.commandName}`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({
            text: `Commande exécutée par ${int.user.username} | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setColor('#ff0000')
        .setTimestamp()

    client.channels.cache.get('1121226924082077747').send({ embeds: [ embed ] })
}

module.exports = {
    commandErrorLog,
    interactionErrorLog
}