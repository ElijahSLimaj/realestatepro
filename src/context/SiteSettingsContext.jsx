import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { siteConfig } from '../data/siteConfig'

const SiteSettingsContext = createContext()

function mapDbToConfig(row) {
  return {
    companyName: row.company_name,
    tagline: row.tagline,
    phone: row.phone,
    email: row.email,
    address: row.address,
    kvk: row.kvk,
    btw: row.btw,
    defaultLang: row.default_lang,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    logoUrl: row.logo_url,
    stats: {
      yearsActive: row.years_active,
      propertiesSold: row.properties_sold,
      happyClients: row.happy_clients,
      teamMembers: row.team_members,
      googleRating: row.google_rating,
    },
    valuationRates: row.valuation_rates || siteConfig.valuationRates,
  }
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    companyName: siteConfig.companyName,
    tagline: siteConfig.tagline,
    phone: siteConfig.phone,
    email: siteConfig.email,
    address: siteConfig.address,
    kvk: siteConfig.kvk,
    btw: siteConfig.btw,
    defaultLang: siteConfig.defaultLang,
    primaryColor: siteConfig.primaryColor,
    accentColor: siteConfig.accentColor,
    logoUrl: null,
    stats: siteConfig.stats,
    valuationRates: siteConfig.valuationRates,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setSettings(mapDbToConfig(data))
        }
        setLoading(false)
      })
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, supabaseConfigured }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
