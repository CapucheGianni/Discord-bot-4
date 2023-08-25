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
            eval(args.join(' '));
        } catch (e) {
            console.log(e);
            message.channel.send(`\`\`\`js${e}\`\`\``);
        }
    }
};