module.exports = {
    name: "ramusage",
    description: "Affiche l'utilisation de la RAM du bot.",
    permissions: [ "OWNER" ],
    stats: {
        category: "Owner",
        usage: "ramusage"
    },
    run(client, command) {
        try {
            command.reply(`L'utilisation de la RAM est actuellement de ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB.`)
        } catch (e) {
            throw new Error(e);
        }
    }
};