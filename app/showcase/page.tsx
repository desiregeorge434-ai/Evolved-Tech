'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Heart, 
  ExternalLink, 
  Gamepad2, 
  MessageSquare, 
  X,
  Send
} from 'lucide-react'

type PromotedGame = {
  id: string
  title: string
  description: string
  image_url: string
  game_url: string
  likes: number
  created_at: string
}

type Comment = {
  id: string
  game_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

export default function ShowcasePage() {
  const router = useRouter()
  const [games, setGames] = useState<PromotedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userLikes, setUserLikes] = useState<string[]>([])
  
  // State for Comments
  const [activeGame, setActiveGame] = useState<PromotedGame | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: gamesData } = await supabase
        .from('promoted_games')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      
      if (gamesData) setGames(gamesData)

      if (user) {
        const { data: likesData } = await supabase
          .from('promoted_likes')
          .select('game_id')
          .eq('user_id', user.id)
        
        if (likesData) setUserLikes(likesData.map(l => l.game_id))
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

  const openComments = async (game: PromotedGame) => {
    setActiveGame(game)
    const supabase = createClient()
    const { data } = await supabase
      .from('promoted_comments')
      .select('*')
      .eq('game_id', game.id)
      .order('created_at', { ascending: true })
    
    if (data) setComments(data)
  }

  const submitComment = async () => {
    if (!newComment.trim() || !userId || !activeGame) return

    setPostingComment(true)
    const supabase = createClient()
    
    // Get user's name for the comment
    const { data: { user } } = await supabase.auth.getUser()
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player'

    const { data, error } = await supabase
      .from('promoted_comments')
      .insert({
        game_id: activeGame.id,
        user_id: userId,
        user_name: userName,
        content: newComment.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setComments([...comments, data])
      setNewComment('')
    }
    setPostingComment(false)
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
                    <div className="flex items-center gap-3">
                      {/* LIKE BUTTON */}
                      <button 
                        onClick={() => handleLike(game.id, game.likes)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          isLiked ? 'text-red-400' : 'text-white/50 hover:text-red-400'
                        }`}
                      >
                        <Heart size={14} className={isLiked ? 'fill-red-400' : ''} /> {game.likes}
                      </button>

                      {/* COMMENT BUTTON */}
                      <button 
                        onClick={() => openComments(game)}
                        className="flex items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-[#00A3FF]"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                    
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

      {/* COMMENT MODAL */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex h-full max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#05060a] shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Comments</h3>
                <p className="text-[10px] text-white/40 truncate max-w-[200px]">{activeGame.title}</p>
              </div>
              <button 
                onClick={() => setActiveGame(null)}
                className="rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare size={24} className="mx-auto text-white/10 mb-2" />
                  <p className="text-xs text-white/30">No comments yet. Be the first!</p>
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white/80">{c.user_name}</span>
                      <span className="text-[9px] text-white/30">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/60">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="border-t border-white/10 p-4">
              {userId ? (
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-[#00A3FF]/60"
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  />
                  <button
                    onClick={submitComment}
                    disabled={postingComment || !newComment.trim()}
                    className="flex items-center justify-center rounded-xl bg-[#00A3FF] px-4 text-white transition-colors hover:bg-[#0089d6] disabled:opacity-50"
                  >
                    {postingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button onClick={() => router.push('/login')} className="text-xs text-[#00A3FF] hover:underline">
                    Sign in to leave a comment
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
