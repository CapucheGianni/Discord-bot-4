const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const addUserMessage = async (client, message) => {
    try {
        const user = await prisma.user.create({
            data: {
                id: message.author.id,
                name: message.author.username,
            }
        });
    } catch (e) {
        return;
    };
};

const addUserInteraction = async (client, interaction) => {
    try {
        const user = await prisma.user.create({
            data: {
                id: interaction.user.id,
                name: interaction.user.username,
            }
        });
    } catch (e) {
        return;
    };
};

module.exports = {
    addUserMessage,
    addUserInteraction
};