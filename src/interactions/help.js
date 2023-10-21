const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');
const { interactionsIds } = require('../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes disponibles")
        .addStringOption((option) => option.setName("commande").setDescription("La commande à afficher")),
    stats: {
        category: "Utilitaire",
        permissions: [],
        id: interactionsIds.help || 'help'
    },
    async execute(client, interaction) {
        try {
            const interactionName = interaction.options.getString("commande");
            const embed = new EmbedBuilder();

            if (interactionName) {
                const cmd = client.interactions.find((comm) => comm.data.name === interactionName);

                if (!cmd) {
                    return interaction.reply({
                        content: `La commande \`${interactionName}\` n'existe pas !`,
                        ephemeral: true
                    });
                }
                embed.setTitle(`Commande \`${cmd.data.name}\` 📚`)
                    .setDescription("Voici les informations sur l'intéraction demandée :")
                    .addFields(
                        {
                            name: "Description",
                            value: cmd.data.description
                        },
                        {
                            name: "Usage",
                            value: `\`/${cmd.data.name}\``,
                            inline: true
                        },
                        {
                            name: "Catégorie",
                            value: cmd.stats.category,
                            inline: true
                        },
                        {
                            name: "Permissions",
                            value: cmd.stats.permissions.length ? cmd.stats.permissions.map((perm) => `\`${perm}\``).join(', ') : "Aucune permission requise",
                            inline: true
                        },
                        {
                            name: "Options",
                            value: cmd.data.options.length ? `>>> ${cmd.data.options.map((option) => `\`${option.name}\`: ${option.description} - ${option.required ? "requis" : "non requis"}`).join('\n')}` : "Aucune option disponible"
                        }
                    )
                    .setFooter({
                        text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp()
                    .setColor(`#ffc800`);
            } else {
                embed.setTitle("Liste des commandes 📚")
                    .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .setDescription(`Voici la liste des intéractions disponibles :\n\n${client.interactions.map((interactions) => `\`/${interactions.data.name}\` - ${interactions.data.description}`).join('\n')}`)
                    .setFooter({
                        text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp()
                    .setColor(`#ffc800`);
            }
            await interaction.reply({ embeds: [ embed ] });

        } catch (e) {
            throw new Error(e);
        }
    }
};