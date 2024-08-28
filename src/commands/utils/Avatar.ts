import {
    Message
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'

@CommandDecorator({
    name: 'avatar',
    description: 'Affiche la photo de profil du membre voulu.',
    cooldown: 1,
    permissions: [],
    category: 'utils',
    usage: 'avatar [user]',
    aliases: ['pp', 'pdp', 'pfp']
})
export default class AvatarCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<void | Message> {
        const user = await this.getMemberFromArg(command.guild, args[0] ?? command.author.id)
        if (!user)
            return command.reply('L\'utilisateur indiqué n\'existe pas.')

        const globalAvatarURL = user.user.displayAvatarURL({ size: 4096 })
        const localAvatarURL = user.avatarURL({ size: 4096 })

        if (localAvatarURL) {
            return command.reply({
                content: `Photos de profil [locale](${localAvatarURL}) et [globale](${globalAvatarURL}) de ${user}:`,
                allowedMentions: { parse: [] }
            })
        }
        return command.reply({
            content: `Photo de profil [globale](${globalAvatarURL}) de ${user}:`,
            allowedMentions: { parse: [] }
        })
    }
}