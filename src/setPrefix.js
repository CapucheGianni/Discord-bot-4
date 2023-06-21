let prefix = '*';

module.exports = {
    getPrefix: () => prefix,
    setPrefix: (newPrefix) => {
        prefix = newPrefix;
    },
};