const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    async run(client, command, args) {
        const embed = new EmbedBuilder()
            .setTitle("Liste des commandes 📚")
            .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ://canary.discord.com/channels/777863908932845588/835895027314065489")
            .setDescription(`voici la liste des commandes disponibles :\n\n${client.commands.map(command => {
                return `\`${command.name}\`: ${command.description}`
            }).join('\n')}`)
            .setFooter({
                text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${infos.version}`
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        await command.reply({
            embeds: [embed]
        });
    }
};