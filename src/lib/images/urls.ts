import { authStore } from '@/stores/authStore';

/**
 * Build a server-sized image URL per spec §5 perf rule #2 — cast hardware
 * cannot decode 4K JPEGs. Always pass width / height so the server can
 * resize on the fly.
 *
 * Path conventions match android image-url assembly:
 *   /api/v1/images/{path}?w=...&h=...
 */

const ABSOLUTE_URL = /^https?:\/\//i;
const TRAILING_SLASH = /\/$/;

// TMDB CDN. Server returns bare TMDB poster/backdrop paths (`/abc.jpg`)
// rather than absolute URLs. The receiver fetches them direct from
// image.tmdb.org — the server doesn't currently expose a proxy at
// /api/v1/images for these paths and TMDB serves them with permissive
// caching headers anyway.
const TMDB_BASE = 'https://image.tmdb.org/t/p';

function pickTmdbSize(width: number | undefined): string {
	if (!width)
		return 'original';
	if (width <= 200)
		return 'w185';
	if (width <= 320)
		return 'w300';
	if (width <= 400)
		return 'w342';
	if (width <= 600)
		return 'w500';
	if (width <= 800)
		return 'w780';
	return 'original';
}

export function buildImageUrl(
	path: string | null | undefined,
	options: { width?: number; height?: number; quality?: number } = {},
): string | null {
	if (!path)
		return null;
	if (ABSOLUTE_URL.test(path))
		return path;

	// TMDB-shaped paths — go straight to TMDB; the server doesn't proxy them.
	if (/\.(jpg|jpeg|png|webp)$/i.test(path)) {
		return `${TMDB_BASE}/${pickTmdbSize(options.width)}${path.startsWith('/') ? path : `/${path}`}`;
	}

	const base = authStore.serverUrl.value?.replace(TRAILING_SLASH, '') ?? '';
	if (!base)
		return null;

	const url = new URL(`${base}/api/v1/images${path.startsWith('/') ? path : `/${path}`}`);
	if (options.width)
		url.searchParams.set('w', String(options.width));
	if (options.height)
		url.searchParams.set('h', String(options.height));
	if (options.quality)
		url.searchParams.set('q', String(options.quality));
	return url.toString();
}

export const POSTER_SIZE = { width: 320, height: 480 } as const;
export const BACKDROP_SIZE = { width: 1280, height: 720 } as const;
export const SQUARE_SIZE = { width: 320, height: 320 } as const;
