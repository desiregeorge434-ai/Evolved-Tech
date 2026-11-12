const LIMN_URL = 'https://pjtpesdhjfvcidfkxord.supabase.co'
const LIMN_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdHBlc2RoamZ2Y2lkZmt4b3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDUyNDUsImV4cCI6MjEwMzcyMTI0NX0.110aDXEqJ4PxjKWNv1Z2YNR8frklg3WW1u0HePDoN38'

const headers = {
  apikey: LIMN_KEY,
  Authorization: `Bearer ${LIMN_KEY}`,
}

export type LimnGame = {
  slug: string
  title: string
  created_at: string
}

export type LimnOverview = {
  games: number
  creators: number
  likes: number
  comments: number
  recent: LimnGame[]
}

async function countRows(table: string): Promise<number> {
  try {
    const res = await fetch(`${LIMN_URL}/rest/v1/${table}?select=*&limit=1`, {
      headers: { ...headers, Prefer: 'count=exact' },
    })
    if (!res.ok) return 0
    const range = res.headers.get('content-range')
    const total = range?.split('/')[1]
    return total ? Number(total) : 0
  } catch {
    return 0
  }
}

export async function loadLimnOverview(): Promise<LimnOverview> {
  const [games, creators, likes, comments] = await Promise.all([
    countRows('games'),
    countRows('profiles'),
    countRows('likes'),
    countRows('comments'),
  ])

  let recent: LimnGame[] = []
  try {
    const res = await fetch(
      `${LIMN_URL}/rest/v1/games?select=slug,title,created_at&order=created_at.desc&limit=6`,
      { headers }
    )
    if (res.ok) recent = await res.json()
  } catch {
    recent = []
  }

  return { games, creators, likes, comments, recent }
}

export function arcadeUrl(slug?: string): string {
  return slug
    ? `https://limn-engine-doc.vercel.app/arcade/game.html?slug=${encodeURIComponent(slug)}`
    : 'https://limn-engine-doc.vercel.app/arcade/'
}
