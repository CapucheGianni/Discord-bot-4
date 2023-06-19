const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { version } = require("../../package.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes disponibles")
        .addStringOption(option => option.setName("commande").setDescription("La commande à afficher")),
    stats: {
        category: "Utilitaire",
        usage: "/help [command]",
    },
    async execute(client, interaction) {
        const interactionName = interaction.options.getString("commande");
        const embed = new EmbedBuilder();

        if (interactionName) {
            const cmd = client.interactions.find(cmd => cmd.data.name === interactionName);

            if (!cmd)
                return interaction.reply({
                    content: `La commande \`${interactionName}\` n'existe pas !`,
                    ephemeral: true
                });
            embed.setTitle(`Commande \`${cmd.data.name}\` 📚`)
            .setDescription(`**Catégorie:** ${cmd.stats.category}\n\n**Description:** ${cmd.data.description}\n\n**Usage:** \`${cmd.stats.usage}\``)
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        } else {
            embed.setTitle("Liste des commandes 📚")
            .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            .setDescription(`Voici la liste des intéractions disponibles :\n\n${client.interactions.map(interactions => {
                return `\`/${interactions.data.name}\` - ${interactions.data.description}`
            }).join('\n')}`)
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        }
        await interaction.reply({
            embeds: [embed]
        });
    }
};