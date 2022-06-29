const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banner')
		.setDescription('Affichez votre bannière ou celle d\'un membre du serveur')
		.addUserOption(option => option.setName('membre').setDescription('La bannière du membre voulu')),
	async execute(_client, interaction) {
		let user = interaction.options.getUser('membre') ?? interaction.user;
		user = await user.fetch();
		if (user) return interaction.reply({content: `Bannière de [${user} : ](${user.bannerURL({ dynamic: true, size: 4096 })})`, allowedMentions: {parse: []}});
	},
};