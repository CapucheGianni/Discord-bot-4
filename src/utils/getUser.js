const getUser = async (client, command, arg) => {
    const user = arg ?? command.author;
    const userExists = await client.users.fetch(user).catch(() => null);

    return command.mentions.users.first() ?? userExists;
};

module.exports = getUser;