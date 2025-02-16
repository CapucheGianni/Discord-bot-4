import { Message } from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { CommandModule } from '@src/classes/ModuleImports.js'
import { CommandDecorator } from '@src/utils/Decorators.js'

const langs: Record<string, string> = {
    fr: 'français',
    en: 'english'
}

@CommandDecorator({
    name: 'lang',
    description: 'Renvoie ou modifie la langue avec laquelle le bot vous répond.',
    cooldown: 3,
    permissions: [],
    category: 'utils',
    usage: 'lang [newLang]',
    aliases: ['lg']
})
export default class PrefixCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<Message | void> {
        const newLang: string | undefined = args[0]
        const userRecord = await client.database.User.findByPk(command.author.id)
        const currentLang = userRecord?.get().lang || 'fr'

        if (!newLang)
            return command.reply(`${client.user?.username} vous répond en ${langs[currentLang] || 'français'}`)

        if (!(newLang in langs))
            return command.reply(`Le code spécifié n'existe pas.`)

        await client.database.User.update(
            { lang: newLang },
            { where: { id: command.author.id } }
        )
        return command.reply(`${client.user?.username} vous répondra désormais en ${langs[newLang]}`)
    }
}
