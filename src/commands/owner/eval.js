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

        return new Promise((resolve) => resolve(eval(args.join(' ')))).then((output) => {
            if (typeof output === 'string' && output.includes(process.env.TOKEN)) output = output.replace(process.env.TOKEN, 'Comment ça mon reuf ?');
            command.channel.send(`\`\`\`js\n${output}\`\`\``);
        }).catch((e) => {
            e = e.toString();
            if (e.includes(process.env.TOKEN)) e = e.replace(process.env.TOKEN, 'Comment ça mon reuf ?');
            command.channel.send(`\`\`\`js\n${e}\`\`\``);
        });
    }
};