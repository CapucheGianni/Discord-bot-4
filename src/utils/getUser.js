const getUser = async (client, command, arg) => {
    let user = arg ?? command.author;
    const userExists = await client.users.fetch(user).catch(() => null);

    return command.mentions.users.first() ?? userExists;
};

module.exports = getUser;