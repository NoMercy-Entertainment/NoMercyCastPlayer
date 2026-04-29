<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
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
useFocusGroup({
	type: 'vertical',
	restorationKey: 'home-rails',
	containerEl,
});

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
</script>

<template>
	<div ref="containerEl" class="home">
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
			<div class="rails">
				<Resolver
					v-for="component in components"
					:key="component.id"
					:component="component"
				/>
			</div>
			<p v-if="isFetching" class="refresh-hint">
				Refreshing…
			</p>
		</template>
	</div>
</template>

<style scoped>
.home {
	height: 100%;
	overflow-y: auto;
	scroll-behavior: smooth;
	scrollbar-width: none;
}
.home::-webkit-scrollbar {
	display: none;
}
.rails {
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 16px 0 64px;
	margin-top: -56px; /* hero scrim overlap, mirrors APK overlap=72.dp */
	position: relative;
	z-index: 1;
}
.refresh-hint {
	position: fixed;
	inset: auto auto 16px 50%;
	transform: translateX(-50%);
	background: oklch(1 0 0 / 0.08);
	padding: 6px 16px;
	border-radius: 999px;
	font-size: 13px;
	color: var(--color-text-secondary);
}
</style>
