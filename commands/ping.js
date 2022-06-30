const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Affiche le ping du bot'),
	async execute(client, interaction) {
		const embed = new client.methods.MessageEmbed()
      .setDescription(`Client Latency: ${client.ws.ping}ms`)
      .setColor(`#ffc800`)
      .setTitle("Pinged Successfully 🏓");
    return interaction.reply({ embeds: [embed] });
  },
};