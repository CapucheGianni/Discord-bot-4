const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles'),
        async execute(client, interaction) {
            const embed = new client.methods.MessageEmbed()
                .setTitle('Liste des commandes 📚')
                .setURL('https://canary.discord.com/channels/777863908932845588/835895027314065489')
                .setDescription(`Voici la liste des commandes disponibles :\n\n/${client.commands.map(command => {
                    return `**${command.data.name}** : ${command.data.description}`
                }).join('\n')}`)
                .setFooter({
                   text: `Commande effectuée par ${interaction.user.username} | ${client.user.username}` //V${client.version}` display the version of the bot
                })
                .setTimestamp()
                .setColor(`#ffc800`);
            return interaction.reply({ embeds: [embed] });
        }
};