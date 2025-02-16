import { GuildMember, Message } from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { CommandModule } from '@src/classes/ModuleImports.js'
import { CommandDecorator } from '@src/utils/Decorators.js'

@CommandDecorator({
    name: 'prefix',
    description: 'Renvoie ou modifie le préfixe du serveur.',
    cooldown: 1,
    permissions: [],
    category: 'utils',
    usage: 'prefix [newPrefix]',
    aliases: []
})
export default class PrefixCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<Message | void> {
        const newPrefix: string | undefined = args[0]
        const prefix = (await client.database.getGuild(command.guildId!)).prefix

        if (newPrefix) {
            if (!(await this.checkPermissions(command, command.member as GuildMember | null, ['ManageGuild'])))
                return
            await client.database.Server.update(
                { prefix: newPrefix },
                { where: { id: command.guildId! } }
            )
            return command.reply(`Le prefix de ${client.user?.username} est désormais \`${newPrefix}\`.`)
        }
        return command.reply(`Le préfixe de ${client.user?.username} est : \`${prefix}\``)
    }
}
