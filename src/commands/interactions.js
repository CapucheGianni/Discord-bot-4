const { prisma } = require('../db/main.js');

module.exports = {
    name: 'interaction',
    description: 'Enable and disable interactions',
    permissions: [ 'OWNER' ],
    stats: {
        category: 'Owner',
        usage: 'interaction [interaction] [enable/disable]'
    },
    async run(client, message, args) {
        try {
            if (args.length < 2) return message.react('❌');

            const commandName = args[0];
            const action = args[1];

            if (!client.interactions.has(commandName)) return message.react('❌');
            await prisma.interaction.update({
                where: { name: commandName },
                data: { disabled: action === 'disable' }
            });
            message.react('✅');
        } catch (e) {
            message.react('❌');
            throw new Error(e);
        }
    }
}