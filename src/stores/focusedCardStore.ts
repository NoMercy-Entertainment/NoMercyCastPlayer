import { pickPaletteColor } from '@/lib/images/urls';
import { ref, watch } from 'vue';

/**
 * Tracks the currently-focused card across the home view so the hero
 * region can swap its backdrop / title / overview based on whatever the
 * user is hovering. Mirrors APK TvHomeScreen.kt's
 *   val activeCardState = remember { MutableStateFlow(...) }
 *   val debouncedFlow = remember { activeCardState.debounce(...) }
 *
 * Debounce: 650ms on horizontal nav (rail scrubbing), 2000ms on
 * vertical nav (rail-to-rail). The APK switches based on
 * navbarBridge.lastNavigationDirection — useDPad calls
 * focusedCardStore.setNavDirection() each keypress so the next fire
 * picks the right delay.
 */

interface PaletteShape {
	dominant?: string;
	primary?: string;
	lightVibrant?: string;
	darkVibrant?: string;
	lightMuted?: string;
	darkMuted?: string;
	light?: string;
	dark?: string;
}

export interface FocusedCardData {
	id?: string;
	title?: string;
	overview?: string;
	backdrop?: string;
	poster?: string;
	logo?: string;
	link?: string;
	year?: number | string;
	type?: string;
	have_items?: number;
	number_of_items?: number;
	color_palette?: {
		backdrop?: PaletteShape;
		poster?: PaletteShape;
		logo?: PaletteShape;
		cover?: PaletteShape;
		image?: PaletteShape;
		profile?: PaletteShape;
	};
}

const _activeCard = ref<FocusedCardData | null>(null);
const _debouncedCard = ref<FocusedCardData | null>(null);
const HORIZONTAL_DEBOUNCE_MS = 650;
const VERTICAL_DEBOUNCE_MS = 2000;
let pending: number | null = null;
let lastNavDir: 'horizontal' | 'vertical' = 'horizontal';

/*
 * Apply the focused card's palette as a CSS variable so the hero scrim,
 * focus borders, and rail accents pick it up automatically. APK
 * NMHomeCard prefers the backdrop palette on TV (since the backdrop
 * aspect dominates the hero area); fall through to poster / cover /
 * image / profile to cover the full media-type matrix.
 */
function applyPalette(card: FocusedCardData | null): void {
	const root = document.documentElement;
	const palette = card?.color_palette;
	const color
		= pickPaletteColor(palette?.backdrop)
			|| pickPaletteColor(palette?.poster)
			|| pickPaletteColor(palette?.cover)
			|| pickPaletteColor(palette?.image)
			|| pickPaletteColor(palette?.profile);
	if (color)
		root.style.setProperty('--color-primary', color);
	else
		root.style.removeProperty('--color-primary');
}

watch(_activeCard, (next) => {
	if (pending !== null) {
		window.clearTimeout(pending);
		pending = null;
	}
	const delay = lastNavDir === 'vertical' ? VERTICAL_DEBOUNCE_MS : HORIZONTAL_DEBOUNCE_MS;
	pending = window.setTimeout(() => {
		_debouncedCard.value = next;
		applyPalette(next);
		pending = null;
	}, delay);
}, { flush: 'post' });

export const focusedCardStore = {
	activeCard: _activeCard,
	debouncedCard: _debouncedCard,
	setActive(card: FocusedCardData | null): void {
		_activeCard.value = card;
	},
	seed(card: FocusedCardData | null): void {
		// Synchronous seed — used on first render so the hero never paints empty.
		_activeCard.value = card;
		_debouncedCard.value = card;
		applyPalette(card);
	},
	setNavDirection(dir: 'horizontal' | 'vertical'): void {
		lastNavDir = dir;
	},
};
