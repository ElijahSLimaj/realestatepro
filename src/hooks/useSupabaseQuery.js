import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export function useSupabaseQuery(table, { select = '*', filters = {}, order, fallbackData = [] } = {}) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    let query = supabase.from(table).select(select)

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
  }, [table, select, JSON.stringify(filters), JSON.stringify(order)])

  return { data, loading, error }
}
