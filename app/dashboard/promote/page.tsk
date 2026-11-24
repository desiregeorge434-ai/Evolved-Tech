'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react'

export default function PromotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [gameUrl, setGameUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !gameUrl) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { error } = await supabase.from('promoted_games').insert({
      user_id: user.id,
      title,
      description,
      image_url: imageUrl,
      game_url: gameUrl
    })

    setLoading(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/showcase')
      }, 2000)
    } else {
      alert("Error posting game: " + error.message)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
        <CheckCircle2 size={48} className="text-emerald-400 mb-6" />
        <h1 className="text-2xl font-bold text-white">Game Published!</h1>
        <p className="mt-2 text-sm text-white/50">Redirecting you to the showcase page...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 lg:py-14">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={20} className="text-[#00A3FF]" />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Showcase Your Game</h1>
      </div>
      <p className="text-sm text-white/45 mb-8">
        Post your game to the Evolved Tech showcase so players on the site can discover and play it. 
        Works for Limn Engine, PlayGame.ai, or any web game.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">Game Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Space Shooter 2"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#00A3FF]/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell players what makes this game fun..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#00A3FF]/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">Screenshot URL (Optional)</label>
          <div className="relative">
            <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://imgur.com/your-image.jpg"
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#00A3FF]/60"
            />
          </div>
          <p className="mt-2 text-[10px] text-white/30">Paste a direct link to an image (Imgur, ImgBB, etc.)</p>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">Play Game Link *</label>
          <div className="relative">
            <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              required
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              placeholder="https://playgame.ai/your-game OR Limn Engine link"
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#00A3FF]/60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !gameUrl}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6] disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Publishing...' : 'Publish to Showcase'}
        </button>
      </form>
    </div>
  )
}
