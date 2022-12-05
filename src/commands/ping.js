const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
    name: "*ping",
    description: "Affiche le ping du bot",
    async execute(client, command) {
        const sent = await command.reply({ content: 'Pinging...', fetchReply: true });
        const embed = new EmbedBuilder()
            .setTitle("Pinged Successfully 🏓")
            .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - command.createdTimestamp}ms`)
            .setFooter({
                text: `Commande effectuée par ${command.user.username} | ${client.user.username} V${infos.version}`
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        return command.editReply({
            content: 'Pinged successfully !',
            embeds: [embed] 
        });
    }
};