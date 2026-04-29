import { inject, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import type { Ref } from 'vue';
import {
	focusStore,

} from '@/stores/focusStore';
import type { Direction, FocusGroupHandle, FocusGroupType } from '@/stores/focusStore';
import { FocusGroupInjectionKey } from './useFocusEntry';
import type { FocusEntry, FocusGroupRegistry } from './useFocusEntry';

export interface FocusGroupOptions {
	type: FocusGroupType;
	/** Stable key for per-route restoration memory. */
	restorationKey?: string;
	/** Which child to focus first on mount, before restoration falls back. */
	initialFocusKey?: string;
	/** For 'grid' type — column count. */
	columns?: number;
	/** Called when focus tries to leave; return true to mark handled. */
	onEscape?: (dir: Direction) => boolean;
	/** Container element for scroll-into-view bookkeeping. */
	containerEl?: Ref<HTMLElement | null>;
	/** Don't auto-focus the first child on mount. */
	autoFocus?: boolean;
}

/**
 * Focus group composable. Provides FocusGroupRegistry to nested
 * useFocusEntry calls, registers itself on the focusStore stack, and
 * (when a parent exists) registers itself as a proxy entry in the
 * parent group so cross-group navigation (rails ↔ rails on home,
 * actions ↔ rails on info, etc.) routes through the parent's
 * pickNeighbor naturally.
 */
export function useFocusGroup(opts: FocusGroupOptions): FocusGroupHandle & FocusGroupRegistry {
	const entries = ref<FocusEntry[]>([]);
	const parent = inject(FocusGroupInjectionKey, null);

	function sortedEnabled(): FocusEntry[] {
		return [...entries.value]
			.sort((a, b) => a.order - b.order)
			.filter(e => e.enabled !== false);
	}

	function pickNeighbor(current: FocusEntry, dir: Direction): FocusEntry | null {
		const list = sortedEnabled();
		const idx = list.indexOf(current);
		if (idx === -1)
			return null;

		switch (opts.type) {
			case 'horizontal':
				if (dir === 'left')
					return list[idx - 1] ?? null;
				if (dir === 'right')
					return list[idx + 1] ?? null;
				return null;
			case 'vertical':
				if (dir === 'up')
					return list[idx - 1] ?? null;
				if (dir === 'down')
					return list[idx + 1] ?? null;
				return null;
			case 'grid': {
				const cols = Math.max(1, opts.columns ?? 1);
				if (dir === 'left')
					return list[idx - 1] ?? null;
				if (dir === 'right')
					return list[idx + 1] ?? null;
				if (dir === 'up')
					return list[idx - cols] ?? null;
				if (dir === 'down')
					return list[idx + cols] ?? null;
				return null;
			}
			case 'modal':
			case 'free': {
				const currentEl = current.el();
				if (!currentEl)
					return null;
				const cur = currentEl.getBoundingClientRect();
				const cx = cur.left + cur.width / 2;
				const cy = cur.top + cur.height / 2;

				let best: FocusEntry | null = null;
				let bestScore = Infinity;
				for (const e of list) {
					if (e === current)
						continue;
					const el = e.el();
					if (!el)
						continue;
					const r = el.getBoundingClientRect();
					const ex = r.left + r.width / 2;
					const ey = r.top + r.height / 2;
					const dx = ex - cx;
					const dy = ey - cy;
					const inDir
						= (dir === 'up' && dy < -1)
							|| (dir === 'down' && dy > 1)
							|| (dir === 'left' && dx < -1)
							|| (dir === 'right' && dx > 1);
					if (!inDir)
						continue;
					const along = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx);
					const perp = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
					const score = along + perp * 2;
					if (score < bestScore) {
						bestScore = score;
						best = e;
					}
				}
				return best;
			}
		}
	}

	const handle: FocusGroupHandle & FocusGroupRegistry = {
		type: opts.type,
		register(entry) {
			entries.value.push(entry);
			return () => {
				entries.value = entries.value.filter(e => e !== entry);
			};
		},
		focusByKey(key) {
			const e = entries.value.find(x => x.key === key && x.enabled !== false);
			if (!e)
				return false;
			e.focus();
			return true;
		},
		focusFirst() {
			const list = sortedEnabled();
			const e = list[0];
			if (!e)
				return false;
			e.focus();
			return true;
		},
		focusLast() {
			const list = sortedEnabled();
			const e = list[list.length - 1];
			if (!e)
				return false;
			e.focus();
			return true;
		},
		hasEntry(key) {
			return entries.value.some(e => e.key === key);
		},
		containsFocused() {
			return entries.value.some(e => e.isFocused());
		},
		handleKey(dir) {
			const current = entries.value.find(e => e.isFocused());
			if (!current) {
				// Focus is outside this group's direct entries — defer to
				// parent so cross-group navigation walks up the tree
				// instead of stealing focus to our first entry.
				if (opts.onEscape?.(dir))
					return true;
				return parent?.handleKey(dir) ?? false;
			}
			const target = pickNeighbor(current, dir);
			if (target) {
				target.focus();
				return true;
			}
			if (opts.type === 'modal')
				return true;
			if (opts.onEscape?.(dir))
				return true;
			return parent?.handleKey(dir) ?? false;
		},
		dispatchEscape() {
			return opts.onEscape?.('back') ?? false;
		},
	};

	provide(FocusGroupInjectionKey, handle);

	let parentUnregister: (() => void) | undefined;
	const proxyKey = `group:${opts.restorationKey ?? Math.random().toString(36).slice(2, 10)}`;

	onMounted(() => {
		focusStore.pushGroup(handle);

		// Register self as a focusable proxy in the parent group so the
		// parent's pickNeighbor can navigate between sibling groups
		// (e.g. rails ↔ rails on home, action col ↔ poster col on info).
		if (parent) {
			const proxyEntry: FocusEntry = {
				key: proxyKey,
				order: 0,
				enabled: true,
				el: () => opts.containerEl?.value ?? null,
				isFocused: () => handle.containsFocused(),
				focus: () => {
					if (opts.restorationKey) {
						const restored = focusStore.consumeRestoration(opts.restorationKey);
						if (restored && handle.focusByKey(restored))
							return;
					}
					handle.focusFirst();
				},
				blur: () => {},
				action: () => {},
			};
			parentUnregister = parent.register(proxyEntry);
		}

		if (opts.autoFocus === false)
			return;

		// Only auto-focus on mount when there's no parent group (root) or
		// when the parent doesn't already own focus. Prevents nested
		// carousels from stealing focus on each mount.
		if (parent && parent.containsFocused())
			return;
		if (opts.restorationKey) {
			const restored = focusStore.consumeRestoration(opts.restorationKey);
			if (restored && handle.focusByKey(restored))
				return;
		}
		if (opts.initialFocusKey)
			handle.focusByKey(opts.initialFocusKey);
	});

	onBeforeUnmount(() => {
		if (opts.restorationKey) {
			const focused = entries.value.find(e => e.isFocused());
			if (focused)
				focusStore.saveRestoration(opts.restorationKey, focused.key);
		}
		parentUnregister?.();
		focusStore.popGroup(handle);
	});

	return handle;
}
