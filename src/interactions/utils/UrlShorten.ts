import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

import settings from '../../../settings.json' with { 'type': 'json' }

@InteractionDecorator({
    name: 'urlshorten',
    description: 'Renvoie un nouveau lien pointant sur le lien choisi.',
    cooldown: 3,
    category: 'utils',
    usage: 'urlshorten <url>',
    data: new SlashCommandBuilder()
        .setName('urlshorten')
        .setDescription('Renvoie un nouveau lien pointant sur le lien choisi.')
        .addStringOption(option => option
            .setName('url')
            .setDescription('Le lien à modifier (http://, https://)')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class UrlShortenInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        const options = interaction.options as CommandInteractionOptionResolver
        const urlToShorten = options.getString('url')
        const rebrandlyUrl = 'https://api.rebrandly.com/v1/links'
        const data = JSON.stringify({ destination: urlToShorten })
        const response = await fetch(rebrandlyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': settings.rebrandly.API_KEY
            },
            body: data
        })

        if (!response.ok)
            return interaction.reply(`Merci de fournir un url valide`)

        const jsonResponse = await response.json()

        return interaction.reply(`https://${jsonResponse.shortUrl}`)
    }
}