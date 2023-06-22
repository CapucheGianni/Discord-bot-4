const fs = require('node:fs');
const path = require('node:path');

const getInteractions = (client) => {
    const interactionsPath = path.join(__dirname, '../interactions');
    const interactionsFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

    for (const file of interactionsFiles) {
        const filePath = path.join(interactionsPath, file);
        const interaction = require(filePath);

        if ('data' in interaction && 'execute' in interaction) {
            client.interactions.set(interaction.data.name, interaction);
        } else {
            console.log(`[WARNING] The interaction at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

module.exports = getInteractions;