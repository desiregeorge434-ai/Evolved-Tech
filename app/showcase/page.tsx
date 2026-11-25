'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Heart, ExternalLink, Gamepad2 } from 'lucide-react'

type PromotedGame = {
  id: string
  title: string
  description: string
  image_url: string
  game_url: string
  likes: number
  created_at: string
}

export default function ShowcasePage() {
  const router = useRouter()
  const [games, setGames] = useState<PromotedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userLikes, setUserLikes] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // 2. Get Approved Games Only
      const { data: gamesData } = await supabase
        .from('promoted_games')
        .select('*')
        .eq('status', 'approved') // <--- ONLY SHOW APPROVED
        .order('created_at', { ascending: false })
      
      if (gamesData) setGames(gamesData)

      // 3. Get User's Likes
      if (user) {
        const { data: likesData } = await supabase
          .from('promoted_likes')
          .select('game_id')
          .eq('user_id', user.id)
        
        if (likesData) {
          setUserLikes(likesData.map(l => l.game_id))
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLike = async (gameId: string, currentLikes: number) => {
    if (!userId) {
      router.push('/login')
      return
    }

    const supabase = createClient()
    const isLiked = userLikes.includes(gameId)

    if (isLiked) {
      setUserLikes(userLikes.filter(id => id !== gameId))
      setGames(games.map(g => g.id === gameId ? { ...g, likes: currentLikes - 1 } : g))
      
      await supabase.from('promoted_likes').delete().eq('game_id', gameId).eq('user_id', userId)
      await supabase.from('promoted_games').update({ likes: currentLikes - 1 }).eq('id', gameId)
    } else {
      setUserLikes([...userLikes, gameId])
      setGames(games.map(g => g.id === gameId ? { ...g, likes: currentLikes + 1 } : g))

      await supabase.from('promoted_likes').insert({ game_id: gameId, user_id: userId })
      await supabase.from('promoted_games').update({ likes: currentLikes + 1 }).eq('id', gameId)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <div className="text-center mb-16">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#00A3FF] mb-3">Community Showcase</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Play what we're building.</h1>
        <p className="mt-4 max-w-xl mx-auto text-sm text-white/50">
          Discover games built by the Evolved Tech community. Hosted on Limn Engine, PlayGame.ai, and beyond.
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20 border border-white/8 bg-white/[0.02] rounded-2xl">
          <Gamepad2 size={32} className="mx-auto text-white/20 mb-4" />
          <h2 className="text-lg font-semibold text-white">No games showcased yet.</h2>
          <p className="text-sm text-white/40 mt-2">Be the first to post your game!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const isLiked = userLikes.includes(game.id)
            return (
              <div key={game.id} className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
                <div className="aspect-video w-full overflow-hidden bg-black/50 relative">
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#00A3FF]/20 via-black to-black">
                      <span className="text-4xl font-black text-white/20 tracking-widest uppercase">
                        {game.title.slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white truncate">{game.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45 line-clamp-3 flex-1">
                    {game.description}
                  </p>
                  
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <button 
                      onClick={() => handleLike(game.id, game.likes)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        isLiked ? 'text-red-400' : 'text-white/50 hover:text-red-400'
                      }`}
                    >
                      <Heart size={14} className={isLiked ? 'fill-red-400' : ''} /> {game.likes}
                    </button>
                    
                    <a 
                      href={game.game_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A3FF]/10 px-3 py-1.5 text-xs font-semibold text-[#00A3FF] transition-colors hover:bg-[#00A3FF]/20"
                    >
                      Play Now <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
