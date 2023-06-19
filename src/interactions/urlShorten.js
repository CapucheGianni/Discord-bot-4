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

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": rebrandlyApiKey,
            },
            body: data,
        }).then(response => {
            if (response.ok)
              return response.json();
        }, networkError => {
            console.log(networkError.message);
        }).then(jsonResponse => {
            try {
                interaction.reply(`https://${jsonResponse.shortUrl}`);
            } catch (err) {
                interaction.reply("Une erreur est survenue lors de la création du lien.");
            }
        });
	}
};