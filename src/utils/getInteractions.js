const fs = require('node:fs');
const util = require('node:util');
const readdir = util.promisify(fs.readdir);

const getInteractions = async (client) => {
    const directories = await readdir('./src/interactions/');

    directories.forEach(async (dir) => {
        const interactions = await readdir(`./src/interactions/${dir}/`);

        interactions.filter((interaction) => interaction.split('.').pop() === 'js').forEach((interaction) => {
            const int = require(`../interactions/${dir}/${interaction}`);

            if ('data' in int && 'execute' in int) {
                client.interactions.set(int.data.name, int);
            } else {
                console.log(`[WARNING] The interaction at ./src/interactions/${dir}/${interaction} is missing a required "data" or "execute" property.`);
            }
        });
    });
};

const getInteractionPath = async (interactionName) => {
    const directories = await readdir('./src/interactions/');
    let path = '';

    for (const dir of directories) {
        const interactions = await readdir(`./src/interactions/${dir}/`);

        interactions.filter((interaction) => interaction.split('.').pop() === 'js').forEach((interaction) => {
            const int = require(`../interactions/${dir}/${interaction}`);

            if (int.data.name === interactionName) path = `interactions/${dir}/${interaction}`;
        });
    }
    return path;
}

module.exports = {
    getInteractions,
    getInteractionPath
};