const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Affiche le ping du bot'),
	async execute(client, interaction) {
		const embed = new client.methods.MessageEmbed()
      .setTitle("Pinged Successfully 🏓")
      .setURL('https://canary.discord.com/channels/777863908932845588/835895027314065489')
      .setDescription(`Client Latency: ${client.ws.ping}ms`)
      .setFooter({
        text: `Commande effectuée par ${interaction.user.username} | ${client.user.username}` //V${client.version}` display the version of the bot
      })
      .setTimestamp()
      .setColor(`#ffc800`);
    return interaction.reply({ embeds: [embed] });
  },
};