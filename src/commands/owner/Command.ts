import { Message, MessageReaction } from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { Logger } from '../../classes/Logger.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'

const logger = Logger.getInstance('')

@CommandDecorator({
    name: 'command',
    description: 'Enable or disable commands.',
    cooldown: 3,
    permissions: [],
    category: 'owner',
    usage: 'command <name> <action>',
    aliases: ['cmd']
})
export default class CommandCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<void | Message | MessageReaction> {
        try {
            if (args.length < 2)
                return command.react('❌')

            const commandName = args[0]
            const action = args[1]
            if (!client.modules.interactions.has(commandName))
                return command.react('❌')
            if (action !== '0' && action !== '1')
                return command.react('❌')

            await client.database.Command.update(
                { enabled: action === '1'},
                { where: { name: commandName, } }
            )
            return command.react('✅')
        } catch (error: any) {
            logger.log(client, error, 'error')
        }
    }
}