const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const addUserMessage = async (client, message) => {
    try {
        await prisma.user.create({
            data: {
                id: message.author.id,
                name: message.author.username
            }
        });
    } catch (e) {
        return 0;
    }
};

const addUserInteraction = async (client, interaction) => {
    try {
        await prisma.user.create({
            data: {
                id: interaction.user.id,
                name: interaction.user.username
            }
        });
    } catch (e) {
        return 0;
    }
};

module.exports = {
    addUserMessage,
    addUserInteraction
};