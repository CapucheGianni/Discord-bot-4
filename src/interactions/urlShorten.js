const { SlashCommandBuilder } = require("@discordjs/builders");
const { rebrandlyApiKey } = require("../../auth.json");
const fetch = require("node-fetch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("urlshorten")
		.setDescription("Réduit la taille d'un url donné")
        .addStringOption(option => option.setName("url").setDescription("Url à raccourcir").setRequired(true)),
	stats: {
		category: "Utilitaire",
		usage: "/urlshorten [url]",
	},
	async execute(client, interaction) {
        const urlToShorten = interaction.options.getString("url");
        const url = "https://api.rebrandly.com/v1/links";
        const data = JSON.stringify({destination: urlToShorten});

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": rebrandlyApiKey,
                },
                body: data
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                return interaction.reply(`https://${jsonResponse.shortUrl}`);
            }
            return interaction.reply("Merci de fournir un url valide.");
        } catch (error) {
            interaction.reply("Une erreur est survenue lors de la création du lien.");
            console.log(error.content);
        }
	}
};