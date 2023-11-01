const fs = require('node:fs');
const util = require('node:util');
const readdir = util.promisify(fs.readdir);

const getCommands = async (client) => {
    const directories = await readdir('./src/commands/');

    for (const dir of directories) {
        const commands = await readdir(`./src/commands/${dir}/`);

        commands.filter((cmd) => cmd.split('.').pop() === 'js').forEach((cmd) => {
            const command = require(`../commands/${dir}/${cmd}`);

            if ('name' in command && 'run' in command) {
                client.commands.set(command.name, command);
            } else {
                console.log(`[WARNING] The command at ./src/commands/${dir}/${cmd} is missing a required "name" or "run" property.`);
            }
        });
    };
};

const getCommandPath = async (commandName) => {
    const directories = await readdir('./src/commands/');
    let path = '';

    for (const dir of directories) {
        const commands = await readdir(`./src/commands/${dir}/`);

        commands.filter((cmd) => cmd.split('.').pop() === 'js').forEach((cmd) => {
            const command = require(`../commands/${dir}/${cmd}`);

            if (command.name === commandName) path = `commands/${dir}/${cmd}`;
        });
    };
    return path;
}

module.exports = {
    getCommands,
    getCommandPath
};