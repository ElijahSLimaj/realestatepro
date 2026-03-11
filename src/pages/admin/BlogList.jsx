import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  AlertCircle,
  Clock,
  Image as ImageIcon,
} from 'lucide-react'

function formatDateNL(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogList() {
  const { tenantId } = useTenant()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [tenantId])

  async function fetchPosts() {
    if (!supabaseConfigured || !tenantId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(
      `Weet je zeker dat je "${post.title_nl || post.slug}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
    )
    if (!confirmed) return

    try {
      setDeletingId(post.id)
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id)

      if (deleteError) throw deleteError
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      console.error('Error deleting blog post:', err)
      alert(`Fout bij verwijderen: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Supabase not configured state
  if (!supabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Blog Artikelen</h1>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Supabase niet geconfigureerd
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Configureer je Supabase omgevingsvariabelen om blogartikelen te beheren.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Blog Artikelen</h1>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Blog Artikelen</h1>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuw artikel
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-error/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Fout bij laden
          </h3>
          <p className="text-neutral-500 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Blog Artikelen</h1>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuw artikel
        </Link>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            Geen artikelen gevonden
          </h3>
          <p className="text-neutral-500 mb-6">
            Begin met het schrijven van je eerste blogartikel.
          </p>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuw artikel
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Afbeelding
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Titel
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Leestijd
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Gepubliceerd
                  </th>
                  <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-14 h-10 rounded-lg object-cover bg-neutral-100"
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-neutral-300" />
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                          {post.title_nl || post.slug}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {post.slug}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          Gepubliceerd
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
                          Concept
                        </span>
                      )}
                    </td>

                    {/* Read Time */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        {post.read_time || 5} min
                      </span>
                    </td>

                    {/* Published Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-500">
                        {post.published_at
                          ? formatDateNL(post.published_at)
                          : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/blog/${post.id}`}
                          className="p-2 rounded-lg text-neutral-400 hover:text-accent hover:bg-accent/5 transition-colors"
                          title="Bewerken"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          className="p-2 rounded-lg text-neutral-400 hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Verwijderen"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
