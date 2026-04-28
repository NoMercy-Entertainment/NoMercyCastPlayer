import { authStore } from '@/stores/authStore'

/**
 * Build a server-sized image URL per spec §5 perf rule #2 — cast hardware
 * cannot decode 4K JPEGs. Always pass width / height so the server can
 * resize on the fly.
 *
 * Path conventions match android image-url assembly:
 *   /api/v1/images/{path}?w=...&h=...
 */
export function buildImageUrl(
  path: string | null | undefined,
  options: { width?: number; height?: number; quality?: number } = {},
): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path

  const base = authStore.serverUrl.value?.replace(/\/$/, '') ?? ''
  if (!base) return null

  const url = new URL(`${base}/api/v1/images${path.startsWith('/') ? path : `/${path}`}`)
  if (options.width) url.searchParams.set('w', String(options.width))
  if (options.height) url.searchParams.set('h', String(options.height))
  if (options.quality) url.searchParams.set('q', String(options.quality))
  return url.toString()
}

export const POSTER_SIZE = { width: 320, height: 480 } as const
export const BACKDROP_SIZE = { width: 1280, height: 720 } as const
export const SQUARE_SIZE = { width: 320, height: 320 } as const
