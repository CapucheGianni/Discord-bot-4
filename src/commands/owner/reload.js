const getEvents = require('../../utils/getEvents.js');
const { getCommandPath } = require('../../utils/getCommands.js');
const { getInteractionPath } = require('../../utils/getInteractions.js');
require('dotenv').config();

const reloadEvent = async (client, command, eventName) => {
    const { events } = client;

    try {
        if (!eventName) {
            for (const [name, event] of events) {
                // client.events.delete(name);
                client.removeListener(`${name}`, event.execute, true);
            }
            command.react('✅');
        }
    } catch (e) {
        console.log(e);
        command.react('❌');
    }
};

const reloadCommand = async (client, command, commandName) => {
    const { commands } = client;

    try {
        if (!commandName) {
            const commandsName = commands.map((command) => command.name);

            for (let i = 0; i < commandsName.length; i++) {
                const path = await getCommandPath(commandsName[i]);

                if (!path) continue;
                delete require.cache[require.resolve(`../../${path}`)];
                client.commands.delete(commandsName[i]);

                const updatedCommand = require(`../../${path}`);

                client.commands.set(updatedCommand.name, updatedCommand);
            }
            command.react('✅');
        } else {
            const oldCommand = commands.get(commandName);
            const path = await getCommandPath(commandName);

            if (!path) return command.react('❌');
            if (!oldCommand) return command.react('❌');
            delete require.cache[require.resolve(`../../${path}`)];
            client.commands.delete(oldCommand.name);

            const updatedCommand = require(`../../${path}`);

            client.commands.set(updatedCommand.name, updatedCommand);
            command.react('✅');
        }
    } catch (e) {
        command.react('❌');
    }
};

const reloadInteraction = async (client, command, interactionName) => {
    const { interactions } = client;

    try {
        if (!interactionName) {
            const interactionsName = interactions.map((interaction) => interaction.data.name);

            for (let i = 0; i < interactionsName.length; i++) {
                const path = await getInteractionPath(interactionsName[i]);

                if (!path) continue;
                delete require.cache[require.resolve(`../../${path}`)];
                client.interactions.delete(interactionsName[i]);

                const updatedInteraction = require(`../../${path}`);

                client.interactions.set(updatedInteraction.data.name, updatedInteraction);
            }
            command.react('✅');
        } else {
            const interaction = interactions.get(interactionName);
            const path = await getInteractionPath(interactionName);

            if (!path) return command.react('❌');
            if (!interaction) return command.react('❌');
            delete require.cache[require.resolve(`../../${path}`)];
            client.interactions.delete(interaction.data.name);

            const updatedInteraction = require(`../../${path}`);

            client.interactions.set(updatedInteraction.data.name, updatedInteraction);
            command.react('✅');
        }
    } catch (e) {
        command.react('❌');
    }
};

module.exports = {
    name: "reload",
    description: "Reload und partie spécifique du bot",
    permissions: ["OWNER"],
    stats: {
        category: "Owner",
        usage: "reload <type> [file]"
    },
    run(client, command, args) {
        if (args.length < 1) command.react('❌');
        switch (args[0]) {
            case 'command':
                return reloadCommand(client, command, args[1]);
            case 'interaction':
                return reloadInteraction(client, command, args[1]);
            case 'event':
                return;
                return reloadEvent(client, command, args[1]);
            default:
                return command.react('❌');
        }
    }
};