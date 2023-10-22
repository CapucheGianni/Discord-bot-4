const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'ratio',
    description: 'Ratio une personne',
    permissions: [],
    stats: {
        category: 'Fun',
        usage: 'ratio <user>'
    },
    async run(client, message, args) {
        try {
            if (args.length === 0) return message.reply('Pas capable de mentionner quelqu\'un ?');

            let ratioNbr = 0;
            let flopNbr = 0;
            const users = [];
            const user = await message.author.fetch();
            const userToRatio = await message.mentions.users.first().fetch();
            const ratio = new ButtonBuilder().setCustomId('ratio').setLabel(ratioNbr + ' ratio').setStyle(ButtonStyle.Success);
            const flop = new ButtonBuilder().setCustomId('flop').setLabel(flopNbr + ' flop').setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(ratio, flop);
            const msg = await message.reply({
                content: `<@${user.id}> veut ratio <@${userToRatio.id}>\n1 minute pour savoir si c'est mérité`,
                components: [row]
            });
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 1000 * 60
            });

            collector.on('collect', async i => {
                if (users.includes(i.user.id)) return i.reply({ content: 'Essaie pas de voter deux fois', ephemeral: true });

                let reply = '';
                const newRow = new ActionRowBuilder();

                users.push(i.user.id);
                if (i.customId === 'ratio') {
                    ratioNbr++;
                    reply = `Ratio ${userToRatio.username}`;
                }
                if (i.customId === 'flop') {
                    flopNbr++;
                    reply = `Flop ${user.username}`;
                }
                newRow.addComponents(ratio.setLabel(ratioNbr + ' ratio'), flop.setLabel(flopNbr + ' flop'));
                msg.edit({ components: [newRow] });
                return i.reply({ content: reply, ephemeral: true });
            });
            setTimeout(() => {
                msg.edit({ components: [] });
                message.channel.send(ratioNbr > flopNbr ? `RATIOOOOOO <@${userToRatio.id}>` : `FLOOOOOOOOP <@${user.id}>`);
            }, 1000 * 60);
        } catch (e) {
            throw new Error(e);
        }
    }
}