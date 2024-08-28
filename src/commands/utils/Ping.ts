import { Message, EmbedBuilder } from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'

@CommandDecorator({
    name: 'ping',
    description: 'Display the ping of the bot',
    cooldown: 1,
    permissions: [],
    category: 'utils',
    usage: 'ping',
    aliases: []
})
export default class PingCommand extends CommandModule {
    public async execute(client: Bot, command: Message): Promise<void> {
        const sent = await command.reply({
            content: 'Pinging...',
        })
        const embed = new EmbedBuilder()
            .setTitle('Pinged Successfully 🏓')
            .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - command.createdTimestamp}ms`)
            .setFooter({
                text: `Commande effectuée par ${command.author.username} | ${client.user?.username} V${client.version}`,
                iconURL: command.author.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        sent.edit({
            content: 'Pinged successfully !',
            embeds: [embed]
        })
    }
}
