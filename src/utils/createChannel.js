const createChannelFromId = async (client, id) => {
    const channel = client.channels.cache.get(id);
    const { guildId } = channel;

    await client.prisma.channel.upsert({
        where: {
            id: channel.id
        },
        create: {
            id: channel.id,
            name: channel.name,
            serverId: guildId
        },
        update: {
            id: channel.id,
            name: channel.name
        }
    });
}

module.exports = {
    createChannelFromId
}