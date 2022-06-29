const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banner')
		.setDescription('Affiche votre bannière ou celle d\'un membre du serveur')
		.addUserOption(option => option.setName('membre').setDescription('La bannière du membre voulu'))
		.addBooleanOption(option => option.setName('couleur').setDescription('Affiche la couleur de la bannière')), // Boolean: true & false
	async execute(_client, interaction) {
		let user = interaction.options.getUser('membre') ?? interaction.user;
		user = await user.fetch();
		if (interaction.options.getBoolean('couleur')) {
			const couleur = `La couleur de la bannière est : ${user.displayHexColor}.` ?? "L'utilisateur n'a pas de couleur personnalisée.";
			return interaction.reply(couleur)
		}
		const message = (user.bannerURL()) ? `Bannière de ${user}[ : ](${user.bannerURL({dynamic: true, size: 4096})})` : `${user} n'a pas de bannière`;
		if (user) return interaction.reply({content: message, allowedMentions: {parse: []}});
	},
};