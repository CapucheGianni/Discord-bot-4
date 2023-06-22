const fs = require('node:fs');
const path = require('node:path');

const getCommands = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('name' in command && 'run' in command) {
            client.commands.set(command.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "run" property.`);
        }
    };
};

module.exports = getCommands;