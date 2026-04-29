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
const TMDB_IMAGE_EXT = /\.(?:jpg|jpeg|png|webp)$/i;

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
	if (TMDB_IMAGE_EXT.test(path)) {
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

const luminosityCache = new Map<string, number>();

export function fastLuminosity(c: string): number {
	const cached = luminosityCache.get(c);
	if (cached !== undefined)
		return cached;

	let r: number, g: number, b: number;

	if (c.charCodeAt(0) === 35) {
		// Hex: parse directly without conversion
		const hex = c.length === 4
			? `${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
			: c.substring(1, 7);
		const n = Number.parseInt(hex, 16);
		r = (n >> 16) & 0xFF;
		g = (n >> 8) & 0xFF;
		b = n & 0xFF;
	}
	else {
		// RGB string: extract numbers directly
		const m = c.match(/(\d+)/g);
		if (!m)
			return 0;
		r = +m[0];
		g = +m[1];
		b = +m[2];
	}

	const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	luminosityCache.set(c, lum);
	return lum;
}

export function tooLight(c: string | null | undefined, max = 130): boolean {
	return !!c && fastLuminosity(c) > max;
}

export function tooDark(c: string | null | undefined, min = 50): boolean {
	return !!c && fastLuminosity(c) < min;
}

export interface PaletteColors {
	darkMuted?: string;
	lightMuted?: string;
	darkVibrant?: string;
	lightVibrant?: string;
	primary?: string;
	dominant?: string;
}

const paletteCache = new WeakMap<PaletteColors, Map<string, string>>();

export function pickPaletteColor(color_palette?: PaletteColors | null | undefined, dark = 40, light = 120): string {
	if (!color_palette || !color_palette.darkVibrant) {
		return '';
	}

	const cacheKey = `${dark},${light}`;
	let cache = paletteCache.get(color_palette);
	if (cache) {
		const cached = cache.get(cacheKey);
		if (cached !== undefined)
			return cached;
	}

	function inRange(c: string | undefined): boolean {
		return !!c && !tooDark(c, dark) && !tooLight(c, light);
	}

	const result
		= inRange(color_palette.darkVibrant)
			? color_palette.darkVibrant!
			: inRange(color_palette.primary)
				? color_palette.primary!
				: inRange(color_palette.dominant)
					? color_palette.dominant!
					: inRange(color_palette.lightVibrant)
						? color_palette.lightVibrant!
						: inRange(color_palette.darkMuted)
							? color_palette.darkMuted!
							: inRange(color_palette.lightMuted)
								? color_palette.lightMuted!
								: '';

	if (!cache) {
		cache = new Map();
		paletteCache.set(color_palette, cache);
	}
	cache.set(cacheKey, result);

	return result;
}
