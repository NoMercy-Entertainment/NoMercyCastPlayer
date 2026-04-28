import { ref, shallowRef } from 'vue';

export type Direction = 'up' | 'down' | 'left' | 'right' | 'back';

export type FocusGroupType = 'horizontal' | 'vertical' | 'grid' | 'modal' | 'free';

export interface FocusGroupHandle {
	type: FocusGroupType;
	handleKey: (dir: Direction) => boolean;
	focusFirst: () => boolean;
	focusLast: () => boolean;
	focusByKey: (key: string) => boolean;
	/** Used by focusStore.requestFocus to walk the stack from bottom up. */
	hasEntry: (key: string) => boolean;
	/** Internal: triggers `escape` callback so modals can close on Back. */
	dispatchEscape: () => boolean;
}

/**
 * Active group stack. Modals push, Back pops. Top-of-stack is the only
 * group that handles d-pad input; lower groups are paused.
 */
const groupStack = shallowRef<FocusGroupHandle[]>([]);

/**
 * Per-restoration-key map of the last-focused entry's stable key. Used to
 * rehydrate focus when groups remount (rail re-renders, route revisits).
 */
const restoration = ref<Map<string, string>>(new Map());

function activeGroup(): FocusGroupHandle | null {
	const stack = groupStack.value;
	return stack.length === 0 ? null : stack[stack.length - 1] ?? null;
}

function pushGroup(group: FocusGroupHandle): void {
	groupStack.value = [...groupStack.value, group];
}

function popGroup(group: FocusGroupHandle): void {
	groupStack.value = groupStack.value.filter(g => g !== group);
}

function saveRestoration(key: string, entryKey: string): void {
	restoration.value.set(key, entryKey);
}

function consumeRestoration(key: string): string | undefined {
	return restoration.value.get(key);
}

/**
 * Trigger Enter on the focused element. The browser does this natively
 * for buttons/links, but custom focusable divs need explicit handling.
 * Fires a synthetic 'click' on document.activeElement so onAction handlers
 * registered via @click resolve uniformly.
 */
function dispatchAction(): boolean {
	const el = document.activeElement as HTMLElement | null;
	if (!el || el === document.body)
		return false;
	el.click();
	return true;
}

function dispatchEscape(): boolean {
	const top = activeGroup();
	return top ? top.dispatchEscape() : false;
}

/**
 * Walk the group stack from bottom up looking for an entry with this key.
 * Used for sender-driven focus override (phone tapped 'play' → receiver
 * navigates AND focuses the play button).
 */
function requestFocus(key: string): boolean {
	for (const g of groupStack.value) {
		if (g.hasEntry(key)) {
			return g.focusByKey(key);
		}
	}
	return false;
}

export const focusStore = {
	groupStack,
	activeGroup,
	pushGroup,
	popGroup,
	saveRestoration,
	consumeRestoration,
	dispatchAction,
	dispatchEscape,
	requestFocus,
};
