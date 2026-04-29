<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useLibraryQuery } from '@/queries/useLibraryQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import EmptyState from '@/components/feedback/EmptyState.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import HomeHero from '../home/HomeHero.vue';
import type { Component } from '@/server-components/types';
import { focusedCardStore } from '@/stores/focusedCardStore';
import type { FocusedCardData } from '@/stores/focusedCardStore';

/*
 * Library drilldown view — used for /libraries/:id, /genres/:id,
 * /collection, /specials. Same hero + rails composition as
 * TvLibraryScreen.kt.
 */

const LEADING_SLASH = /^\//;

const route = useRoute();

const path = computed(() => {
	// Library-style routes share the same useLibraryQuery API surface — pass
	// the URL path through, stripping the leading slash, so it slots into
	// /api/v1/{path}?version=lolomo.
	return route.fullPath.replace(LEADING_SLASH, '').split('?')[0];
});

const containerEl = ref<HTMLElement | null>(null);
const railsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: `library-rails`,
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge({ handle: railsGroup, containerEl });

const { data, isLoading, error, refetch, isFetching } = useLibraryQuery(path);

const isInitialLoad = computed(() => isLoading.value && !data.value);
const components = computed<Component[]>(() => data.value ?? []);

interface CarouselWrapper {
	items?: Array<{ component: string; props?: { title?: string; data?: FocusedCardData } }>;
}

const seedCard = computed<FocusedCardData | null>(() => {
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

watch(
	[seedCard, path],
	([card]) => {
		if (card)
			focusedCardStore.seed(card);
	},
	{ immediate: true },
);

const heroCard = computed(() => focusedCardStore.debouncedCard.value);

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
	<div ref="containerEl" class="library">
		<template v-if="error">
			<ErrorPanel
				:error="error as Error"
				:retry="() => refetch()"
				context="Couldn't load this library"
			/>
		</template>
		<template v-else-if="isInitialLoad">
			<Skeleton type="rail" :count="6" />
			<Skeleton type="rail" :count="6" />
			<Skeleton type="rail" :count="6" />
		</template>
		<template v-else-if="components.length === 0">
			<EmptyState
				message="This library is empty."
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
.library {
	height: 100%;
	overflow-y: auto;
	scroll-behavior: smooth;
	scrollbar-width: none;
	scroll-padding-top: 96px;
	scroll-padding-bottom: 96px;
}
.library::-webkit-scrollbar {
	display: none;
}
.rails {
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 8px 0 64px;
	margin-top: -72px;
	position: relative;
	z-index: 1;
}
.rails > :deep(.rail-section) {
	scroll-margin-top: 120px;
	scroll-margin-bottom: 80px;
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
