require('dotenv').config();

module.exports = {
    name: "reloadinteractions",
    description: "Reload les interactions",
    permissions: [ "OWNER" ],
    stats: {
        category: "Owner",
        usage: "reloadinteractions [interaction]"
    },
    run(client, command, args) {
        try {
            if (args.length < 1) command.react('❌');

            const { interactions } = client;
            const commandName = args[0]?.toLowerCase();
            const interaction = interactions.get(commandName);

            if (!interaction) return command.react('❌');
            delete require.cache[require.resolve(`../interactions/${interaction.data.name}.js`)];
            try {
                client.interactions.delete(interaction.data.name);

                const newInteraction = require(`../interactions/${interaction.data.name}.js`);

                client.interactions.set(newInteraction.data.name, newInteraction);
            } catch (e) {
                command.react('❌');
                throw new Error(e);
            }
            return command.react('✅');
        } catch (e) {
            command.react('❌');
            throw new Error(e);
        }
    }
};