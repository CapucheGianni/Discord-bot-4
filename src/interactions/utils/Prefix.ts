import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember,
    InteractionResponse
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

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
        .setDMPermission(false)
})
export default class PrefixInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<void | InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const newPrefix = options.getString('prefix')
        const prefix = (await client.database.getGuild(interaction.guildId!)).prefix

        if (newPrefix) {
            if (!(await this.checkPermissions(interaction, interaction.member as GuildMember | null, ['ManageGuild'])))
                return
            await client.database.Server.update(
                { prefix: newPrefix },
                { where: { id: interaction.guildId! } }
            )
            return interaction.reply(`Le prefix de ${client.user!.username} est désormais \`${newPrefix}\`.`)
        }
        return interaction.reply(`Le préfixe de ${client.user!.username} est : \`${prefix}\``)
    }
}