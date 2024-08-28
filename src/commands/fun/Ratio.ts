import {
    Message,
    InteractionResponse,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { Logger } from '../../classes/Logger.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'

const logger = Logger.getInstance('')

@CommandDecorator({
    name: 'ratio',
    description: 'Parce que c\'est fun de ratio quelqu\'un',
    cooldown: 1,
    permissions: [],
    category: 'fun',
    usage: 'ratio <user>',
    aliases: []
})
export default class RatioCommand extends CommandModule {
    public async execute(client: Bot, message: Message, args: string[]): Promise<void | InteractionResponse | Message> {
        try {
            if (args.length === 0)
                return message.reply('Pas capable de mentionner quelqu\'un ?')

            let ratioNbr = 0
            let flopNbr = 0
            const userIds: string[] = []
            const user = await message.author.fetch()
            const userToRatioUnfetched = message.mentions.users.first()
            if (!userToRatioUnfetched)
                return message.reply('Pas capable de mentionner quelqu\'un ?')

            const userToRatio = await userToRatioUnfetched.fetch()
            const ratio = new ButtonBuilder().setCustomId('ratio').setLabel(ratioNbr + ' ratio').setStyle(ButtonStyle.Success)
            const flop = new ButtonBuilder().setCustomId('flop').setLabel(flopNbr + ' flop').setStyle(ButtonStyle.Danger)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(ratio, flop)
            const msg = await message.reply({
                content: `${user} veut ratio ${userToRatio}\n1 minute pour savoir si c'est mérité`,
                components: [row]
            })
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 1000 * 60
            })

            collector.on('collect', async i => {
                if (userIds.includes(i.user.id))
                    return i.reply({ content: 'Essaie pas de voter deux fois', ephemeral: true })

                let reply = ''

                userIds.push(i.user.id)
                if (i.customId === 'ratio') {
                    ratioNbr++
                    reply = `Ratio ${userToRatio.username}`
                }
                if (i.customId === 'flop') {
                    flopNbr++
                    reply = `Flop ${user.username}`
                }
                row.components[0].setLabel(ratioNbr + ' ratio')
                row.components[1].setLabel(flopNbr + ' flop')
                msg.edit({ components: [row] })
                return i.reply({ content: reply, ephemeral: true })
            })
            setTimeout(() => {
                msg.edit({ components: [] })
                message.channel.send(ratioNbr > flopNbr ? `RATIOOOOOO ${userToRatio}` : `FLOOOOOOOOP ${user}`)
            }, 1000 * 60)
        } catch (error: any) {
            logger.log(client, error, 'error')
        }
    }
}