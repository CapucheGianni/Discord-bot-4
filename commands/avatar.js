const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Affiche votre photo de profil ou celle d\'un membre du serveur')
		.addUserOption(option => option.setName('membre').setDescription('La photo de profil du membre voulu')),
	async execute(_client, interaction) {
		const user = interaction.options.getUser('membre');
		if (user) return interaction.reply(`Photo de profil de ${user.username} :\n ${user.displayAvatarURL({ dynamic: true, size: 4096 })}`);
		return interaction.reply(`Votre [photo de profil :](${interaction.user.displayAvatarURL({ dynamic: true, size: 4096 })})`);
	},
};