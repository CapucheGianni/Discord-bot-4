const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');
const { getPrefix } = require("../utils/setPrefix.js");

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    stats: {
        category: 'Utilitaire',
        usage: 'help [command]',
    },
    async run(client, command, args) {
        const commandName = args[0];
        const embed = new EmbedBuilder();

        if (args[1])
            return command.reply("Merci de n'indiquer qu'une seule commande");
        if (commandName) {
            const cmd = client.commands.find(cmd => cmd.name === commandName);

            if (!cmd)
                return command.reply(`La command \`${commandName}\` n'existe pas !`);
            embed.setTitle(`Commande \`${commandName}\` 📚`)
            .setDescription(`**Catégorie:** ${cmd.stats.category}\n\n**Description:** ${cmd.description}\n\n**Usage:** \`${getPrefix()}${cmd.stats.usage}\``)
            .setFooter({
                text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${version}`,
                iconURL: command.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        } else {
            embed.setTitle("Liste des commandes 📚")
            .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            .setDescription(`voici la liste des commandes disponibles :\n\n${client.commands.map(command => {
                return `\`${getPrefix()}${command.name}\` - ${command.description}`
            }).join('\n')}`)
            .setFooter({
                text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${version}`,
                iconURL: command.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        }
        await command.reply({
            embeds: [embed]
        });
    }
};