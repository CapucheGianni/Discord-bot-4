import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

@InteractionDecorator({
    name: 'avatar',
    description: 'Affiche la photo de profil du membre voulu.',
    cooldown: 1,
    category: 'utils',
    usage: 'avatar [user]',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche la photo de profil du membre voulu.')
        .addUserOption(option => option
            .setName('utilisateur')
            .setDescription('L\'utilisateur voulu')
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class AvatarInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        const options = interaction.options as CommandInteractionOptionResolver
        const user = (options.getMember('utilisateur') ?? interaction.member) as GuildMember
        const globalAvatarURL = user.user.displayAvatarURL({ size: 4096 })
        const localAvatarURL = user.avatarURL({ size: 4096 })

        if (localAvatarURL) {
            return interaction.reply({
                content: `Photos de profil [locale](${localAvatarURL}) et [globale](${globalAvatarURL}) de ${user}:`,
                allowedMentions: { parse: [] }
            })
        }
        interaction.reply({
            content: `Photo de profil [globale](${globalAvatarURL}) de ${user}:`,
            allowedMentions: { parse: [] }
        })
    }
}