const getUser = require("../utils/getUser");

module.exports = {
    name: "avatar",
    description: "Affiche l'avatar d'un utilisateur",
    stats: {
        category: "Image",
        usage: "avatar [membre]",
    },
    async run(client, command, args) {
        const user = await getUser(client, command, args[0]);

        if (user) {
            return command.reply({
                content: `Photo de profil de **${user}** :\n${user.displayAvatarURL({ dynamic: true, size: 4096 })}`,
                allowedMentions: {parse: []}
            });
        } else {
            return command.reply({
                content: "Merci d'indiquer un utilisateur valide."
            });
        };
    }
};