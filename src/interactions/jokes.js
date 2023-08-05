const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("jokes")
		.setDescription("Choisissez si vous voulez que le bot réponde à certains de vos messages ou non.")
		.addBooleanOption(option => option.setName("activer").setDescription("Active ou désactive les blagues.")),
	stats: {
		category: "Image",
		usage: "/avatar [membre]",
		permissions: []
	},
	async execute(client, interaction) {
		const choice = interaction.options.getBoolean("activer");

		if (choice) {
			await prisma.user.update({
				where: {
					userid: interaction.user.id
				},
				data: {
					userjokes: true
				}
			});
			interaction.reply({
				content: "Les blagues ont été activées avec succès !",
				ephemeral: true
			});
		} else {
			await prisma.user.update({
				where: {
					userid: interaction.user.id
				},
				data: {
					userjokes: false
				}
			});
			interaction.reply({
				content: "Les blagues ont été désactivées avec succès !",
				ephemeral: true
			});
		}
	}
};