const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const serverUpdate = async (guildId, choice, interaction) => {
	if (choice) {
		await prisma.server.update({
			where: {
				id: guildId
			},
			data: {
				jokes: true
			}
		});
		interaction.reply({
			content: "Les blagues ont été activées sur le serveur avec succès !",
			ephemeral: true
		});
	} else {
		await prisma.server.update({
			where: {
				id: guildId
			},
			data: {
				jokes: false
			}
		});
		interaction.reply({
			content: "Les blagues ont été désactivées sur le serveur avec succès !",
			ephemeral: true
		});
	}
};

const userUpdate = async (userId, choice, interaction) => {
	if (choice) {
		await prisma.user.update({
			where: {
				id: userId
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
				id: userId
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
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("jokes")
		.setDescription("Choisissez si vous voulez que le bot réponde à certains de vos messages ou non.")
		.addBooleanOption(option => option.setName("serveur").setDescription("Active ou désactive les blagues sur le serveur."))
		.addBooleanOption(option => option.setName("activer").setDescription("Active ou désactive les blagues.")),
	stats: {
		category: "Utilitaire",
		usage: "/jokes [true/false]",
		permissions: []
	},
	async execute(client, interaction) {
		try {
			const choice = interaction.options.getBoolean("activer");
			const server = interaction.options.getBoolean("serveur");

			if (server) {
				if (!interaction.member.permissions.has("ManageGuild")) {
					return interaction.reply({
						content: "Vous n'avez pas les permissions nécessaires pour modifier le préfixe !",
						ephemeral: true
					});
				}
				serverUpdate(interaction.guild.id, choice, interaction);
			} else {
				userUpdate(interaction.user.id, choice, interaction);
			}
		} catch (e) {
			console.error(e);
		};
	}
};