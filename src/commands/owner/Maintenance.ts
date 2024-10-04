import { Message, MessageReaction } from "discord.js"

import Bot from "../../classes/Bot.js"
import Logger from "../../classes/Logger.js"
import { CommandModule } from "../../classes/ModuleImports.js"
import { CommandDecorator } from "../../utils/Decorators.js"

const logger = Logger.getInstance('')

@CommandDecorator({
    name: 'maintenance',
    description: 'Enable or disable maintenance state.',
    cooldown: 3,
    permissions: [],
    category: 'owner',
    usage: 'maintenance <action>',
    aliases: []
})
export default class MaintenanceCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<MessageReaction> {
        if (!args.length)
            return command.react('❌')
        if (args[0] !== '0' && args[0] !== '1')
            return command.react('❌')

        try {
            await client.database.Bot.update(
                { maintenance: args[0] === '1' },
                { where: { id: client.user?.id } }
            )
            return command.react('✅')
        } catch (error: any) {
            logger.log(client, error, 'error')
            return command.react('❌')
        }
    }
}