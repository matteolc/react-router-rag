"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'
import { en } from '~/lib/translations/en'

type TranslationValue = string | { [key: string]: TranslationValue }

type Translations = {
  [key: string]: TranslationValue
}

const translations: { [key: string]: Translations } = {
  en,
}

type TranslationsContextType = {
  t: (key: string) => string
  locale: string
  setLocale: (locale: string) => void
}

const TranslationsContext = createContext<TranslationsContextType | null>(null)

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en')

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: TranslationValue = translations[locale]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = typeof value === 'object' ? value[k] : key
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <TranslationsContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </TranslationsContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationsContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider')
  }
  return context
} 