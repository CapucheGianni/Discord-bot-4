import { Bot } from '../../classes/Bot.js'
import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember
} from 'discord.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Logger } from '../../classes/Logger.js'

const logger = Logger.getInstance('')

@InteractionDecorator({
    name: 'prefix',
    description: 'Renvoie ou modifie le préfixe du serveur.',
    cooldown: 3,
    category: 'utils',
    usage: 'prefix [prefix]',
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Renvoie ou modifie le préfixe du serveur.')
        .addStringOption(option => option
            .setName('prefix')
            .setDescription('Set le préfixe à une nouvelle valeur')
            .setMaxLength(5)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class PrefixInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        const options = interaction.options as CommandInteractionOptionResolver
        const newPrefix = options.getString('prefix')
        const prefix = (await client.database.getGuild(interaction.guildId!)).prefix

        if (newPrefix) {
            if (!(await this.checkPermissions(interaction, interaction.member as GuildMember, ['ManageGuild'])))
                return
            client.database.Server.update(
                { prefix: newPrefix },
                { where: { id: interaction.guildId! } }
            )
            return interaction.reply(`Le prefix de ${client.user!.username} est désormais \`${newPrefix}\`.`)
        }
        interaction.reply(`Le préfixe de ${client.user!.username} est : \`${prefix}\``)
    }
}