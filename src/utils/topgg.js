const DBL = require('dblapi.js');
const topGg = require('../../settings.json');

const setTopGg = (client) => {
    if (client.user.username !== 'Kaide') return;

    const dbl = new DBL(topGg.TOKEN, client);

    dbl.on('posted', () => {});
    dbl.on('error', e => {
      console.error(`Oops! ${e}`);
    });
};

module.exports = setTopGg;