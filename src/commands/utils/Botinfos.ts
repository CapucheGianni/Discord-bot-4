import {
    Message,
    EmbedBuilder
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'
import { isBot } from '../../utils/TypeGuards.js'

@CommandDecorator({
    name: 'botinfos',
    description: 'Affiche des informations utiles sur le bot.',
    cooldown: 1,
    permissions: [],
    category: 'utils',
    usage: 'botinfos',
    aliases: ['bi']
})
export default class BotinfosCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<void | Message> {
        const bot = (await client.database.Bot.findByPk(client.user?.id))?.get()
        if (!isBot(bot) || !client.user)
            return command.reply('Une erreur est survenue lors de l\'éxécution de la commande.')

        const embed = new EmbedBuilder()
            .setTitle('Bot informations')
            .addFields(
                { name: 'Uptime', value: `The bot has been started <t:${Math.floor((Date.now() - client.uptime!) / 1000)}:R>`, inline: true },
                { name: 'Start date', value: `<t:${Math.floor(client.readyTimestamp! / 1000)}>`, inline: true },
                { name: 'Creation date', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true},
                { name: 'Ram usage', value: `L'utilisation de la RAM est actuellement de ${client.getRamUsage}MB.` },
                { name: 'Total servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Total users', value: `${client.users.cache.size}`, inline: true},
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: 'Bot version', value: client.version, inline: true },
                { name: 'Node.js version', value: process.version, inline: true}
            )
            .setImage(client.user.displayAvatarURL())
            .setFooter({
                text: `Intéraction effectuée par ${command.author.username} | ${client.user.username} V${client.version}`,
                iconURL: command.author.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        return command.reply({ embeds: [embed] })
    }
}