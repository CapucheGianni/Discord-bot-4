const getUser = require('../../utils/getUser');

module.exports = {
    name: "avatar",
    description: "Affiche l'avatar d'un utilisateur",
    permissions: [],
    stats: {
        category: "Utilitaire",
        usage: "avatar [membre]",
        alias: ['pp', 'pdp', 'pfp']
    },
    async run(client, command, args) {
        try {
            const user = await getUser(client, command, args[0]);

            if (user) {
                return command.reply({
                    content: `Photo de profil de **${user}** :\n${user.displayAvatarURL({
                        dynamic: true,
                        size: 4096
                    })}`,
                    allowedMentions: { parse: [] }
                });
            }
            return command.reply("Merci d'indiquer un utilisateur valide." );
        } catch (e) {
            throw new Error(e);
        }
    }
};