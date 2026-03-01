import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children, defaultLang = 'nl' }) {
  const [lang, setLang] = useState(defaultLang)

  const t = useCallback((key, vars = {}) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    if (typeof value === 'string') {
      return Object.entries(vars).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
        value
      )
    }
    return value || key
  }, [lang])

  const switchLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
