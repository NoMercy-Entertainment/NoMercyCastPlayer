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
const DEFAULT_DEBOUNCE_MS = 650;
let pending: number | null = null;

watch(_activeCard, (next) => {
	if (pending !== null) {
		window.clearTimeout(pending);
		pending = null;
	}
	pending = window.setTimeout(() => {
		_debouncedCard.value = next;
		pending = null;
	}, DEFAULT_DEBOUNCE_MS);
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
	},
};
