import { Bot } from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { Logger } from '../classes/Logger.js'

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