import i18next from 'i18next'
import enTranslations from './locales/en/translations'
import frTranslations from './locales/fr/translations'

const resources = {
    en: { translation: enTranslations },
    fr: { translation: frTranslations }
}

await i18next.init({
    debug: true,
    defaultNS: 'translation',
    fallbackLng: 'fr',
    resources,
})

export default i18next