const addUserMessage = async (client, message) => {
    try {
        await client.prisma.user.upsert({
            where: {
                id: message.author.id
            },
            create: {
                id: message.author.id,
                name: message.author.username
            },
            update: {
                name: message.author.username
            }
        });
    } catch (e) {
        return 0;
    }
};

const addUserInteraction = async (client, interaction) => {
    try {
        await client.prisma.user.upsert({
            where: {
                id: interaction.user.id
            },
            create: {
                id: interaction.user.id,
                name: interaction.user.username
            },
            update: {
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