import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Home,
  AlertCircle,
  Star,
  ImageOff,
} from 'lucide-react'

const formatPrice = (price) =>
  new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)

const statusConfig = {
  active: { label: 'Actief', bg: 'bg-success/15', text: 'text-success' },
  sold: { label: 'Verkocht', bg: 'bg-error/15', text: 'text-error' },
  rented: { label: 'Verhuurd', bg: 'bg-blue-500/15', text: 'text-blue-600' },
  draft: { label: 'Concept', bg: 'bg-neutral-200', text: 'text-neutral-600' },
}

const typeLabels = {
  sale: 'Koop',
  rent: 'Huur',
}

export default function PropertiesList() {
  const { tenantId } = useTenant()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (supabaseConfigured && tenantId) {
      fetchProperties()
    } else {
      setLoading(false)
    }
  }, [tenantId])

  async function fetchProperties() {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Weet je zeker dat je "${title || 'deze woning'}" wilt verwijderen?`)) {
      return
    }

    setDeleting(id)
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Error deleting property:', err)
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  // Supabase not configured
  if (!supabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">
          Supabase niet geconfigureerd
        </h3>
        <p className="text-neutral-500 max-w-md mb-6">
          Stel de <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm">VITE_SUPABASE_URL</code> en{' '}
          <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm">VITE_SUPABASE_ANON_KEY</code>{' '}
          omgevingsvariabelen in om woningen te beheren.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Woningen</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Beheer alle woningen en vastgoed
          </p>
        </div>
        <Link
          to="/admin/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuwe woning
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Nog geen woningen
          </h3>
          <p className="text-neutral-500 max-w-sm mb-6">
            Voeg je eerste woning toe om te beginnen.
          </p>
          <Link
            to="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuwe woning
          </Link>
        </div>
      ) : (
        /* Data table */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Afbeelding
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Titel
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Stad
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Prijs
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600">
                    Uitgelicht
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {properties.map((property) => {
                  const images = Array.isArray(property.images)
                    ? property.images
                    : []
                  const thumbnail = images[0] || null
                  const status = statusConfig[property.status] || statusConfig.draft

                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-14 h-10 rounded-md overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="w-4 h-4 text-neutral-300" />
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/properties/${property.id}`}
                          className="font-medium text-primary hover:text-accent transition-colors"
                        >
                          {property.title_nl || (
                            <span className="text-neutral-400 italic">
                              Geen titel
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3 text-neutral-600">
                        {property.city || '-'}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-medium text-primary">
                        {formatPrice(property.price)}
                        {property.type === 'rent' && (
                          <span className="text-neutral-400 font-normal">
                            /mnd
                          </span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/8 text-primary">
                          {typeLabels[property.type] || property.type}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.bg} ${status.text}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center">
                        {property.is_featured ? (
                          <Star className="w-4 h-4 text-accent fill-accent inline-block" />
                        ) : (
                          <Star className="w-4 h-4 text-neutral-300 inline-block" />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/properties/${property.id}`}
                            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary transition-colors"
                            title="Bewerken"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(property.id, property.title_nl)
                            }
                            disabled={deleting === property.id}
                            className="p-2 rounded-lg text-neutral-500 hover:bg-error/10 hover:text-error transition-colors disabled:opacity-50 cursor-pointer"
                            title="Verwijderen"
                          >
                            {deleting === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
