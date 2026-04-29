<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useHomeQuery } from '@/queries/useHomeQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import EmptyState from '@/components/feedback/EmptyState.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import HomeHero from './HomeHero.vue';
import type { Component } from '@/server-components/types';
import { focusedCardStore } from '@/stores/focusedCardStore';
import type { FocusedCardData } from '@/stores/focusedCardStore';

/*
 * Mirrors APK TvHomeScreen.kt — hero region pinned to the top of the
 * viewport, rails laid below it with a small overlap so the rail nudge
 * peeks under the hero scrim. Hero is seeded with the first card of the
 * first carousel; once focus events flow we'll let the focused card
 * drive the hero (Phase 2).
 */

const containerEl = ref<HTMLElement | null>(null);
const railsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'home-rails',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge({ handle: railsGroup, containerEl });

const { data, isLoading, error, refetch, isFetching } = useHomeQuery();

const isInitialLoad = computed(() => isLoading.value && !data.value);
const components = computed<Component[]>(() => data.value ?? []);

type CardData = FocusedCardData;

interface CarouselWrapper {
	items?: Array<{ component: string; props?: { title?: string; data?: CardData } }>;
}

const seedCard = computed<CardData | null>(() => {
	for (const c of components.value) {
		if (!c.props || typeof c.props !== 'object')
			continue;
		const wrapper = c.props as CarouselWrapper;
		const items = wrapper.items;
		if (!Array.isArray(items) || items.length === 0)
			continue;
		const first = items.find(i => i.props?.data && (i.props.data.backdrop || i.props.data.poster));
		if (first?.props?.data)
			return first.props.data;
	}
	return null;
});

// Seed the focused-card store with the first available card the moment the
// home query lands — keeps the hero filled while the user is still on the
// nav row. Subsequent focus events from NMCard update the store directly.
watch(
	seedCard,
	(card) => {
		if (card && !focusedCardStore.activeCard.value)
			focusedCardStore.seed(card as FocusedCardData);
	},
	{ immediate: true },
);

const heroCard = computed(() => focusedCardStore.debouncedCard.value);

// APK TvHomeScreen auto-retries home query every 15s while in error state
// so the screen recovers automatically when the server comes back online.
let retryTimer: number | null = null;
watch(error, (next) => {
	if (next) {
		if (retryTimer === null) {
			retryTimer = window.setInterval(() => {
				void refetch();
			}, 15_000);
		}
	}
	else if (retryTimer !== null) {
		window.clearInterval(retryTimer);
		retryTimer = null;
	}
});
onBeforeUnmount(() => {
	if (retryTimer !== null)
		window.clearInterval(retryTimer);
});
</script>

<template>
	<div ref="containerEl" class="home nm-hero-rails-screen">
		<template v-if="error">
			<ErrorPanel
				:error="error as Error"
				:retry="() => refetch()"
				context="Couldn't load home"
			/>
		</template>
		<template v-else-if="isInitialLoad">
			<Skeleton type="rail" :count="4" />
			<Skeleton type="rail" :count="6" />
			<Skeleton type="rail" :count="6" />
		</template>
		<template v-else-if="components.length === 0">
			<EmptyState
				message="Your home is empty. Add a library on your phone or desktop to get started."
				:action="{ label: 'Refresh', onAction: () => refetch() }"
			/>
		</template>
		<template v-else>
			<HomeHero v-if="heroCard" :card="heroCard" />
			<div class="nm-hero-rails">
				<Resolver
					v-for="component in components"
					:key="component.id"
					:component="component"
				/>
			</div>
			<p v-if="isFetching" class="nm-refresh-hint">
				Refreshing…
			</p>
		</template>
	</div>
</template>
