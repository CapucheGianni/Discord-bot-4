const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("jokes")
		.setDescription("Choisissez si vous voulez que le bot réponde à certains de vos messages ou non.")
		.addBooleanOption(option => option.setName("activer").setDescription("Active ou désactive les blagues.")),
	stats: {
		category: "Utilitaire",
		usage: "/jokes [true/false]",
		permissions: []
	},
	async execute(client, interaction) {
		try {
			const choice = interaction.options.getBoolean("activer");

			if (choice) {
				await prisma.user.update({
					where: {
						id: interaction.user.id
					},
					data: {
						jokes: true
					}
				});
				interaction.reply({
					content: "Les blagues ont été activées avec succès !",
					ephemeral: true
				});
			} else {
				await prisma.user.update({
					where: {
						id: interaction.user.id
					},
					data: {
						jokes: false
					}
				});
				interaction.reply({
					content: "Les blagues ont été désactivées avec succès !",
					ephemeral: true
				});
			}
		} catch (e) {
			console.error(e);
		};
	}
};