const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');
const { getPrefix } = require('../utils/setPrefix.js');

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    permissions: [],
    stats: {
        category: 'Utilitaire',
        usage: 'help [command]',
        alias: ['h', 'aide']
    },
    async run(client, command, args) {
        try {
            const commandName = args[ 0 ];
            const embed = new EmbedBuilder();
            const cmdList = client.commands.filter((cmd) => cmd.permissions[ 0 ] !== "OWNER");
            const prefix = await getPrefix(command.guildId);

            if (args[ 1 ]) {
                return command.reply("Merci de n'indiquer qu'une seule commande");
            }
            if (commandName) {
                const cmd = client.commands.find((comm) => comm.name === commandName);

                if (!cmd || cmd.permissions[ 0 ] === "OWNER") {
                    return command.reply(`La command \`${commandName}\` n'existe pas !`);
                }
                embed.setTitle(`Commande \`${commandName}\` 📚`)
                    .setDescription("Voici les informations sur la commande demandée :")
                    .addFields(
                        {
                            name: "Catégorie",
                            value: cmd.stats.category,
                            inline: true
                        },
                        {
                            name: "Description",
                            value: cmd.description,
                            inline: true
                        },
                        {
                            name: "Usage",
                            value: `\`${prefix}${cmd.stats.usage}\``,
                            inline: true
                        },
                        {
                            name: "Permissions",
                            value: cmd.permissions.length ? cmd.permissions.map((perm) => `\`${perm}\``).join(', ') : "Aucune permission requise",
                            inline: true
                        }
                    )
                    .setFooter({
                        text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${version}`,
                        iconURL: command.author.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp()
                    .setColor(`#ffc800`);
            } else {
                embed.setTitle("Liste des commandes 📚")
                    .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .setDescription(`voici la liste des commandes disponibles :\n\n${cmdList.map((comm) => `\`${prefix}${comm.name}\` - ${comm.description}`).join('\n')}`)
                    .setFooter({
                        text: `Commande effectuée par ${command.author.username} | ${client.user.username} V${version}`,
                        iconURL: command.author.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp()
                    .setColor(`#ffc800`);
            }
            await command.reply({ embeds: [ embed ] });
        } catch (e) {
            throw new Error(e);
        }
    }
};