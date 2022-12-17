const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    stats: {
        category: 'Utilitaire',
        usage: '*help [command]',
    },
    async run(client, command, args) {
        const commandName = args[0];
        if (args[1]) return command.reply("Merci de n'indiquer qu'une seule commande");

        if (commandName) {
            const cmd = client.commands.find(cmd => cmd.name === commandName);

            if (!cmd) return command.reply(`La command \`${commandName}\` n'existe pas !`);
            const embed = new EmbedBuilder()
                .setTitle(`Commande \`${commandName}\` 📚`)
                .setDescription(`**Catégorie:** ${cmd.stats.category}\n\n**Description:** ${cmd.description}\n\n**Usage:** \`${cmd.stats.usage}\``)
                .setFooter({
                    text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${infos.version}`
                })
                .setTimestamp()
                .setColor(`#ffc800`);
            await command.reply({
                embeds: [embed]
            });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("Liste des commandes 📚")
                .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .setDescription(`voici la liste des commandes disponibles :\n\n${client.commands.map(command => {
                    return `\`*${command.name}\`: ${command.description}`
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
    }
};