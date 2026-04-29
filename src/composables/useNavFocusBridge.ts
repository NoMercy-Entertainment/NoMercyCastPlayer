import { onBeforeUnmount, onMounted } from 'vue';
import { focusStore } from '@/stores/focusStore';
import type { FocusGroupHandle } from '@/stores/focusStore';

/**
 * Cross-zone focus bridge between the topnav and the active page.
 * Mirrors APK LocalNavbarFocusBridge.kt — without it, pressing
 * ArrowDown on a topnav item or ArrowUp on the topmost rail just
 * returns null and the user is stuck.
 *
 * Each page passes its FocusGroupHandle here on mount. The topnav
 * fires 'cast-receiver:nav-down' when ArrowDown leaves the nav row,
 * and the page's bridge calls handle.focusFirst() to land on whatever
 * the screen's first focusable happens to be (carousel, action button,
 * etc.).
 */

const TOPNAV_RESTORATION_KEYS = [
	'topnav-mini-player',
	'nav-home',
	'nav-libraries',
	'nav-music',
	'nav-search',
	'nav-profile',
];

export function useNavFocusBridge(handle: FocusGroupHandle): void {
	const onNavDown = (): void => {
		handle.focusFirst();
	};

	onMounted(() => {
		window.addEventListener('cast-receiver:nav-down', onNavDown);
	});
	onBeforeUnmount(() => {
		window.removeEventListener('cast-receiver:nav-down', onNavDown);
	});
}

export function focusTopnav(): boolean {
	for (const key of TOPNAV_RESTORATION_KEYS) {
		if (focusStore.requestFocus(key))
			return true;
	}
	return false;
}
