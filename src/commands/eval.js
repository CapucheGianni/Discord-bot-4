module.exports = {
    name: 'eval',
    description: 'Execute n\'importe quel code',
    permissions: [ 'OWNER' ],
    stats: {
        category: 'Owner',
        usage: 'eval [code]'
    },
    run(client, message, args) {
        try {
            if (args.join(' ').includes('token')) {
                return message.channel.send('Nope');
            }
            eval(args.join(' '));
        } catch (e) {
            message.channel.send(`\`\`\`js${e}\`\`\``);
        }
    }
};