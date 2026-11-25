'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, ExternalLink, ShieldAlert } from 'lucide-react'

type PendingGame = {
  id: string
  title: string
  description: string
  image_url: string
  game_url: string
  created_at: string
}

export default function ReviewPage() {
  const router = useRouter()
  const [games, setGames] = useState<PendingGame[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    const checkAdminAndFetch = async () => {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      
      // 2. LOCK THIS PAGE TO YOUR EMAIL ONLY
      // Change this email to your actual Evolved Tech login email
      if (user?.email !== 'desiregeorge434@gmail.com') {
        setIsAdmin(false)
        setLoading(false)
        return // Stop here, they are not the admin
      }

      setIsAdmin(true)

      // 3. Fetch Pending Games
      const { data } = await supabase
        .from('promoted_games')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      
      if (data) setGames(data)
      setLoading(false)
    }
    
    checkAdminAndFetch()
  }, [])

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    const supabase = createClient()
    
    // Remove from UI instantly
    setGames(games.filter(g => g.id !== id))
    
    // Update Database
    await supabase.from('promoted_games').update({ status: newStatus }).eq('id', id)
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
        <ShieldAlert size={48} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-white/50">You do not have permission to view this page.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-8 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/20">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Review</h1>
        <p className="mt-2 text-sm text-white/45">Review games submitted by the community before they go live on the showcase.</p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20 border border-white/8 bg-white/[0.02] rounded-2xl">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400/50 mb-4" />
          <h2 className="text-lg font-semibold text-white">All caught up!</h2>
          <p className="text-sm text-white/40 mt-2">No pending games to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="flex flex-col md:flex-row gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              
              <div className="w-full md:w-64 aspect-video shrink-0 overflow-hidden rounded-xl bg-black/50 border border-white/5">
                {game.image_url ? (
                  <img src={game.image_url} alt={game.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/30">No Image</div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{game.title}</h3>
                  <p className="mt-1 text-sm text-white/50 line-clamp-2">{game.description || 'No description provided.'}</p>
                  
                  <a 
                    href={game.game_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#00A3FF] hover:underline"
                  >
                    Test Game Link <ExternalLink size={12} />
                  </a>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleAction(game.id, 'approved')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(game.id, 'rejected')}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
