import {
    Message,
    EmbedBuilder
} from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { CommandModule } from '@src/classes/ModuleImports.js'
import { CommandDecorator } from '@src/utils/Decorators.js'

@CommandDecorator({
    name: 'banner',
    description: 'Affiche la bannière du membre voulu.',
    cooldown: 1,
    permissions: [],
    category: 'utils',
    usage: 'banner [\'color\'] [user]',
    aliases: ['bannière']
})
export default class BannerCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<void | Message> {
        if (args[0] === 'color') {
            const user = await this.getMemberFromArg(command.guild, args[1] ?? command.author.id)
            if (!user)
                return command.reply('L\'utilisateur mentionné n\'existe pas.')

            const fetchedUser = await user.user.fetch()
            if (!fetchedUser.hexAccentColor) {
                return command.reply({
                    content: `${user} n'a pas de bannière.`,
                    allowedMentions: { parse: [] }
                })
            }
            const embed = new EmbedBuilder()
                .setDescription(`**[${fetchedUser.hexAccentColor}](https://colorhexa.com/${fetchedUser.hexAccentColor})**`)
                .setColor(fetchedUser.hexAccentColor)

            return command.reply({
                content: `La bannière de ${user} est ${fetchedUser.hexAccentColor}.`,
                embeds: [ embed ],
                allowedMentions: { parse: [] }
            })
        }
        const user = await this.getMemberFromArg(command.guild, args[0] ?? command.author.id)
        if (!user)
            return command.reply('L\'utilisateur mentionné n\'existe pas.')

        const fetchedUser = await user.user.fetch()
        const bannerUrl = fetchedUser.bannerURL({ size: 4096 })
        return command.reply({
            content: bannerUrl ? `[Bannière](${bannerUrl}) de ${user} :` : `${user} ne possède pas de bannière.`,
            allowedMentions: { parse: [] }
        })
    }
}