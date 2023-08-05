const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUserWriting = async (client, message) => {
    try {
        const user = await prisma.user.create({
            data: {
                userid: message.author.id,
                username: message.author.username,
            }
        });
    } catch (e) {
        return;
    };
};

module.exports = getUserWriting;