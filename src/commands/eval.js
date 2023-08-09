module.exports = {
    name: 'eval',
    description: 'Execute n\'importe quel code',
    permissions: [ 'OWNER' ],
    stats: {
        category: 'Owner',
        usage: 'eval [code]'
    },
    run(client, message, args) {
        eval(args.join(' '));
    }
};