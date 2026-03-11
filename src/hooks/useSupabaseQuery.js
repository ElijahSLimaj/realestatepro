import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useTenant } from '../context/TenantContext'

export function useSupabaseQuery(table, { select = '*', filters = {}, order, fallbackData = [], tenantScoped = true } = {}) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { tenantId } = useTenant()

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    // If tenant-scoped but no tenant yet, wait
    if (tenantScoped && !tenantId) {
      setLoading(false)
      return
    }

    let query = supabase.from(table).select(select)

    // Automatically filter by tenant_id for tenant-scoped tables
    if (tenantScoped && tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value)
      }
    })

    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? true })
    }

    query.then(({ data: rows, error: err }) => {
      if (err) {
        setError(err)
        console.error(`Supabase query error (${table}):`, err)
      } else {
        setData(rows || [])
      }
      setLoading(false)
    })
  }, [table, select, JSON.stringify(filters), JSON.stringify(order), tenantId, tenantScoped])

  return { data, loading, error }
}
