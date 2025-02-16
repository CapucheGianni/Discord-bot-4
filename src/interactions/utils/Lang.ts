import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    InteractionResponse,
    ApplicationIntegrationType,
    InteractionContextType
} from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { InteractionModule } from '@src/classes/ModuleImports.js'
import { InteractionDecorator } from '@src/utils/Decorators.js'

const langs: Record<string, string> = {
    fr: 'français',
    en: 'english'
}

@InteractionDecorator({
    name: 'lang',
    description: 'Renvoie ou modifie la langue avec laquelle le bot vous répond.',
    cooldown: 3,
    category: 'utils',
    usage: 'lang [lang]',
    data: new SlashCommandBuilder()
        .setName('lang')
        .setDescription('Renvoie ou modifie la langue avec laquelle le bot vous répond.')
        .addStringOption(option => option
            .setName('lang')
            .setDescription('Choisissez une nouvelle langue.')
            .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
})
export default class PrefixInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> {
        const choices = Object.entries(langs).map(([code, language]) => ({
            name: language,
            value: code,
        }))

        return interaction.respond(choices)
    }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<void | InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const newLang = options.getString('lang')
        const userRecord = await client.database.User.findByPk(interaction.user.id)
        const currentLang = userRecord?.get().lang || 'fr'

        if (!newLang)
            return interaction.reply(`${client.user?.username} vous répond en ${langs[currentLang] || 'fr'}`)

        if (!(newLang in langs))
            return interaction.reply(`Le code spécifié n'existe pas.`)

        await client.database.User.update(
            { lang: newLang },
            { where: { id: interaction.user.id } }
        )
        return interaction.reply(`${client.user?.username} vous répondra désormais en ${langs[newLang]}`)
    }
}