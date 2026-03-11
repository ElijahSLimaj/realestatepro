import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Settings as SettingsIcon,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle,
  Building2,
  Palette,
  BarChart3,
  Calculator,
  Globe,
} from 'lucide-react'

const DEFAULT_SETTINGS = {
  company_name: '',
  tagline: '',
  phone: '',
  email: '',
  address: '',
  kvk: '',
  btw: '',
  primary_color: '#0C1D2E',
  accent_color: '#C8944A',
  logo_url: '',
  years_active: 0,
  properties_sold: 0,
  happy_clients: 0,
  team_members: 0,
  google_rating: 0,
  valuation_rates: '{}',
  default_lang: 'nl',
}

export default function Settings() {
  const { tenantId } = useTenant()
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [settingsId, setSettingsId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [tenantId])

  async function fetchSettings() {
    if (!supabaseConfigured || !tenantId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

      if (data) {
        setSettingsId(data.id)
        setForm({
          company_name: data.company_name || '',
          tagline: data.tagline || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          kvk: data.kvk || '',
          btw: data.btw || '',
          primary_color: data.primary_color || '#0C1D2E',
          accent_color: data.accent_color || '#C8944A',
          logo_url: data.logo_url || '',
          years_active: data.years_active || 0,
          properties_sold: data.properties_sold || 0,
          happy_clients: data.happy_clients || 0,
          team_members: data.team_members || 0,
          google_rating: data.google_rating || 0,
          valuation_rates: data.valuation_rates
            ? JSON.stringify(data.valuation_rates, null, 2)
            : '{}',
          default_lang: data.default_lang || 'nl',
        })
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      setError('Kon instellingen niet ophalen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Parse valuation_rates JSON
    let parsedRates
    try {
      parsedRates = JSON.parse(form.valuation_rates)
    } catch {
      setError('Taxatietarieven JSON is ongeldig.')
      setSaving(false)
      return
    }

    const payload = {
      company_name: form.company_name,
      tagline: form.tagline,
      phone: form.phone,
      email: form.email,
      address: form.address,
      kvk: form.kvk,
      btw: form.btw,
      primary_color: form.primary_color,
      accent_color: form.accent_color,
      logo_url: form.logo_url,
      years_active: Number(form.years_active) || 0,
      properties_sold: Number(form.properties_sold) || 0,
      happy_clients: Number(form.happy_clients) || 0,
      team_members: Number(form.team_members) || 0,
      google_rating: Number(form.google_rating) || 0,
      valuation_rates: parsedRates,
      default_lang: form.default_lang,
      updated_at: new Date().toISOString(),
    }

    try {
      if (settingsId) {
        // Update existing row
        const { error } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('tenant_id', tenantId)
          .eq('id', settingsId)
        if (error) throw error
      } else {
        // Insert new row (upsert)
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ ...payload, tenant_id: tenantId })
          .select()
          .single()
        if (error) throw error
        setSettingsId(data.id)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setError('Opslaan mislukt. Controleer de invoer.')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const inputClasses =
    'w-full ps-3.5 pe-10 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8944A]/30 focus:border-[#C8944A]'

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Supabase niet geconfigureerd</p>
          <p className="mt-0.5 text-amber-700">
            Configureer je Supabase-project om instellingen te beheren. Voeg VITE_SUPABASE_URL en
            VITE_SUPABASE_ANON_KEY toe aan je .env bestand.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D2E]">Instellingen</h1>
          <p className="text-neutral-500 mt-1">Beheer je site-instellingen en bedrijfsgegevens.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#C8944A] hover:bg-[#b5833f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Opslaan
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle size={16} />
          Instellingen succesvol opgeslagen!
        </div>
      )}

      <div className="space-y-6">
        {/* Section: Company Info */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0C1D2E]">Bedrijfsgegevens</h2>
              <p className="text-xs text-neutral-400">Basisinformatie van je bedrijf</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bedrijfsnaam</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  className={inputClasses}
                  placeholder="VastGoed Elite"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className={inputClasses}
                  placeholder="Uw betrouwbare makelaar"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Telefoon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={inputClasses}
                  placeholder="+32 2 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputClasses}
                  placeholder="info@vastgoedelite.be"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Adres</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={inputClasses}
                placeholder="Koningsstraat 1, 1000 Brussel"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">KVK-nummer</label>
                <input
                  type="text"
                  value={form.kvk}
                  onChange={(e) => updateField('kvk', e.target.value)}
                  className={inputClasses}
                  placeholder="0123.456.789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">BTW-nummer</label>
                <input
                  type="text"
                  value={form.btw}
                  onChange={(e) => updateField('btw', e.target.value)}
                  className={inputClasses}
                  placeholder="BE0123456789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Branding */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Palette size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0C1D2E]">Huisstijl</h2>
              <p className="text-xs text-neutral-400">Kleuren en logo</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Primaire kleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => updateField('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={(e) => updateField('primary_color', e.target.value)}
                    className={`flex-1 ${inputClasses} font-mono`}
                    placeholder="#0C1D2E"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Accentkleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className={`flex-1 ${inputClasses} font-mono`}
                    placeholder="#C8944A"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Logo URL</label>
              <input
                type="text"
                value={form.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
                className={inputClasses}
                placeholder="https://..."
              />
              {form.logo_url && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-xl inline-block">
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BarChart3 size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0C1D2E]">Statistieken</h2>
              <p className="text-xs text-neutral-400">Cijfers die op de website worden getoond</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jaren actief</label>
                <input
                  type="number"
                  value={form.years_active}
                  onChange={(e) => updateField('years_active', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Verkocht</label>
                <input
                  type="number"
                  value={form.properties_sold}
                  onChange={(e) => updateField('properties_sold', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tevreden klanten</label>
                <input
                  type="number"
                  value={form.happy_clients}
                  onChange={(e) => updateField('happy_clients', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teamleden</label>
                <input
                  type="number"
                  value={form.team_members}
                  onChange={(e) => updateField('team_members', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Google rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.google_rating}
                  onChange={(e) => updateField('google_rating', e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Valuation Rates */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Calculator size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0C1D2E]">Taxatietarieven</h2>
              <p className="text-xs text-neutral-400">JSON-configuratie voor taxatietarieven</p>
            </div>
          </div>
          <div className="p-6">
            <textarea
              rows={8}
              value={form.valuation_rates}
              onChange={(e) => updateField('valuation_rates', e.target.value)}
              className={`${inputClasses} font-mono text-xs resize-y`}
              placeholder='{"apartment": 250, "house": 350, "villa": 500}'
            />
            <p className="text-xs text-neutral-400 mt-2">
              Voer geldige JSON in. Voorbeeld: {`{"apartment": 250, "house": 350}`}
            </p>
          </div>
        </div>

        {/* Section: Language */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <Globe size={16} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0C1D2E]">Taal</h2>
              <p className="text-xs text-neutral-400">Standaard taalinstelling</p>
            </div>
          </div>
          <div className="p-6">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Standaardtaal</label>
              <select
                value={form.default_lang}
                onChange={(e) => updateField('default_lang', e.target.value)}
                className={`${inputClasses} cursor-pointer`}
              >
                <option value="nl">Nederlands (NL)</option>
                <option value="fr">Frans (FR)</option>
                <option value="en">Engels (EN)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#C8944A] hover:bg-[#b5833f] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Instellingen opslaan
          </button>
        </div>
      </div>
    </div>
  )
}
