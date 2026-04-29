import { computed, watch } from 'vue';
import type { Ref } from 'vue';
import { focusedCardStore } from '@/stores/focusedCardStore';
import type { FocusedCardData } from '@/stores/focusedCardStore';
import type { Component } from '@/server-components/types';

/**
 * Walks the server-driven home/library/music components and seeds the
 * focusedCardStore with the first card that has a backdrop or poster,
 * so the HomeHero never paints empty while the user is still on the
 * topnav. Mirrors APK TvHomeScreen.kt's `firstItem` seed.
 */

interface CarouselWrapper {
	items?: Array<{ component: string; props?: { title?: string; data?: FocusedCardData } }>;
}

export function useHeroSeed(components: Ref<Component[]>): void {
	const seedCard = computed<FocusedCardData | null>(() => {
		for (const c of components.value) {
			if (!c.props || typeof c.props !== 'object')
				continue;
			const wrapper = c.props as CarouselWrapper;
			const items = wrapper.items;
			if (!Array.isArray(items) || items.length === 0)
				continue;
			const first = items.find(
				i => i.props?.data && (i.props.data.backdrop || i.props.data.poster),
			);
			if (first?.props?.data)
				return first.props.data;
		}
		return null;
	});

	watch(
		seedCard,
		(card) => {
			if (card && !focusedCardStore.activeCard.value)
				focusedCardStore.seed(card);
		},
		{ immediate: true },
	);
}
