import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const TenantContext = createContext()

/**
 * Resolves the current tenant from:
 * 1. Subdomain (agency.yourdomain.com)
 * 2. ?tenant=slug query param (dev mode)
 * 3. Path-based slug from router (passed as prop)
 */
function resolveTenantSlug() {
  // 1. Check query param (dev mode)
  const params = new URLSearchParams(window.location.search)
  const querySlug = params.get('tenant')
  if (querySlug) return querySlug

  // 2. Check subdomain
  const hostname = window.location.hostname
  const parts = hostname.split('.')

  // Skip for localhost without subdomain, IP addresses
  if (parts.length >= 3 && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    const subdomain = parts[0]
    // Skip common non-tenant subdomains
    if (!['www', 'app', 'api', 'admin', 'platform'].includes(subdomain)) {
      return subdomain
    }
  }

  // Also handle agency.localhost for dev
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    const subdomain = parts[0]
    if (subdomain !== 'localhost' && subdomain !== 'www') {
      return subdomain
    }
  }

  return null
}

export function TenantProvider({ children, slug: propSlug }) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const slug = propSlug || resolveTenantSlug()

  useEffect(() => {
    if (!slug) {
      // No tenant slug = platform/landing page mode
      setLoading(false)
      return
    }

    if (!supabaseConfigured) {
      // Demo mode: fake tenant
      setTenant({
        id: 'demo-tenant-id',
        name: 'VastGoed Elite',
        slug: slug,
        plan: 'pro',
        plan_status: 'active',
      })
      setLoading(false)
      return
    }

    fetchTenant(slug)
  }, [slug])

  async function fetchTenant(tenantSlug) {
    try {
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('not_found')
        } else {
          throw fetchError
        }
      } else {
        setTenant(data)
      }
    } catch (err) {
      console.error('Failed to resolve tenant:', err)
      setError('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TenantContext.Provider value={{ tenant, tenantId: tenant?.id, slug, loading, error, isPlatform: !slug }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
