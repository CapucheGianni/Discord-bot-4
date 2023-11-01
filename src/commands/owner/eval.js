require('dotenv').config();

module.exports = {
    name: 'eval',
    description: 'Execute n\'importe quel code',
    permissions: ['OWNER'],
    stats: {
        category: 'Owner',
        usage: 'eval [code]'
    },
    run(client, command, args) {
        if (!args[0]) return command.react('❌');
        if (args.join(' ').includes('token')) return command.channel.send('Nope');

        const result = new Promise((resolve) => resolve(eval(args.join(' '))));

        return result.then((output) => {
            if (output.includes(process.env.TOKEN)) output = output.replace(process.env.TOKEN, 'Comment ça mon reuf ?');
            command.channel.send(output, { code: 'js' });
        }).catch((e) => {
            e = e.toString();
            if (e.includes(process.env.TOKEN)) e = e.replace(process.env.TOKEN, 'Comment ça mon reuf ?');
            command.channel.send(e, { code: 'js' });
        })
    }
};