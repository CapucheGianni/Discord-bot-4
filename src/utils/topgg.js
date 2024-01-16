const { AutoPoster } = require('topgg-autoposter')
const topGg = require('../../settings.json');

const setTopGg = (client) => {
    if (client.user.username !== 'Kaide') return;

    const ap = AutoPoster(topGg.topgg.TOKEN, client)

    ap.on('posted', () => {
        console.log("All useful informations were pushed to the top.gg API.");
    });
    ap.on('error', e => {
        console.error(`Oops! ${e}`);
    });
};

module.exports = setTopGg;