import { pickPaletteColor } from '@/lib/images/urls';
import { ref, watch } from 'vue';

/**
 * Tracks the currently-focused card across the home view so the hero
 * region can swap its backdrop / title / overview based on whatever the
 * user is hovering. Mirrors APK TvHomeScreen.kt's
 *   val activeCardState = remember { MutableStateFlow(...) }
 *   val debouncedFlow = remember { activeCardState.debounce(...) }
 *
 * Debounce defaults: 650ms (horizontal nav) / 2000ms (vertical nav).
 * The APK switches based on lastNavigationDirection; we use 650ms
 * everywhere for now and tighten later if it feels wrong.
 */

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
		backdrop?: { dominant?: string; light?: string; dark?: string; primary?: string };
		poster?: { dominant?: string; light?: string; dark?: string; primary?: string };
		logo?: { dominant?: string; light?: string; dark?: string; primary?: string };
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
 * focus borders, and rail accents pick it up automatically.
 */
function applyPalette(card: FocusedCardData | null): void {
	const root = document.documentElement;
	const palette = card?.color_palette;
	const color = pickPaletteColor(palette?.poster ?? palette?.backdrop ?? null);
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
