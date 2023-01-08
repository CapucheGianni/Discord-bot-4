module.exports = {
    name: "avatar",
    description: "Affiche l'avatar d'un utilisateur",
    stats: {
        category: "Image",
        usage: "*avatar [membre]",
    },
    async run(client, command, args) {
        const user = args[0] ?? command.author;
        const userExists = await client.users.fetch(user).catch(() => null);
        const userMention = command.mentions.users.first() ?? userExists;

        if (userMention) {
            return command.reply({
                content: `Photo de profil de **${userMention}** :\n${userMention.displayAvatarURL({ dynamic: true, size: 4096 })}`, allowedMentions: {parse: []}
            });
        } else {
            return command.reply({
                content: "Merci d'indiquer un utilisateur valide."
            });
        };
    },
};