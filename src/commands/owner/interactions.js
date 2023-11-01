const { prisma } = require('../../db/main.js');

module.exports = {
    name: 'interactions',
    description: 'Enable and disable interactions',
    permissions: ['OWNER'],
    stats: {
        category: 'Owner',
        usage: 'interactions <interaction> <enable/disable>'
    },
    async run(client, command, args) {
        try {
            if (args.length < 2) return command.react('❌');

            const commandName = args[0];
            const action = args[1];

            if (!client.interactions.has(commandName)) return command.react('❌');
            await prisma.interaction.update({
                where: { name: commandName },
                data: { disabled: action === 'disable' }
            });
            command.react('✅');
        } catch (e) {
            command.react('❌');
            throw new Error(e);
        }
    }
}