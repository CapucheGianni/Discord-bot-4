import Bot from '@src/classes/Bot.js'
import { EventModule } from '@src/classes/ModuleImports.js'
import { EventDecorator } from '@src/utils/Decorators.js'
import Logger from '@src/classes/Logger.js'

const logger = Logger.getInstance('')

@EventDecorator({
    name: 'error',
    eventType: 'on'
})
export default class GuildCreate extends EventModule {
    public async execute(client: Bot, error: Error): Promise<void> {
        logger.log(client, error, 'error')
    }
}