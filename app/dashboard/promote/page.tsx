'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  UploadCloud,
  X
} from 'lucide-react'

export default function PromotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gameUrl, setGameUrl] = useState('')
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

    let uploadedImageUrl = ''

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName)
        
      uploadedImageUrl = publicUrl
    }

    const { error } = await supabase.from('promoted_games').insert({
      user_id: user.id,
      title,
      description,
      image_url: uploadedImageUrl,
      game_url: gameUrl,
      status: 'pending' // <--- SAVES AS PENDING FOR ADMIN REVIEW
    })

    setLoading(false)

    if (!error) {
      setSuccess(true)
      // No longer redirects to showcase, tells them to wait
    } else {
      alert("Error posting game: " + error.message)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
        <CheckCircle2 size={48} className="text-emerald-400 mb-6" />
        <h1 className="text-2xl font-bold text-white">Game Submitted!</h1>
        <p className="mt-2 text-sm text-white/50">Your game is pending admin review and will appear in the showcase shortly.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-8 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/20">
          Back to Dashboard
        </button>
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
        Post your game to the Evolved Tech showcase so players can discover it. 
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">Screenshot</label>
          
          {imagePreview ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white/70 hover:text-white backdrop-blur-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                isDragging 
                  ? 'border-[#00A3FF] bg-[#00A3FF]/10' 
                  : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <UploadCloud size={28} className={`mb-3 ${isDragging ? 'text-[#00A3FF]' : 'text-white/20'}`} />
              <p className="text-sm font-medium text-white/70">Click or drag image here</p>
              <p className="mt-1 text-[10px] text-white/30">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

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
          {loading ? 'Submitting for Review...' : 'Submit Game for Review'}
        </button>
      </form>
    </div>
  )
}
