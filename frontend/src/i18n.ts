import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import uk from './locales/uk/translation.json'

const storedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('i18nextLng') : null
const fallbackLanguage = 'en'
const detectedLanguage = storedLanguage && ['en', 'uk'].includes(storedLanguage) ? storedLanguage : fallbackLanguage

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        uk: { translation: uk },
    },
    lng: detectedLanguage,
    fallbackLng: fallbackLanguage,
    supportedLngs: ['en', 'uk'],
    interpolation: {
        escapeValue: false,
    },
})

i18n.on('languageChanged', (language) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('i18nextLng', language)
    }
})

export default i18n
