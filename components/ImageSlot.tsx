'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

type Props = {
  src: string
  alt: string
  label?: string
  className?: string
  ratio?: string
}

export function ImageSlot({ src, alt, label, className = '', ratio = 'aspect-[16/10]' }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] ${ratio} ${className}`}
    >
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
          <ImageIcon size={20} className="text-white/20" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{label ?? alt}</p>
          <p className="break-all font-mono text-[9px] text-white/15">{src}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
