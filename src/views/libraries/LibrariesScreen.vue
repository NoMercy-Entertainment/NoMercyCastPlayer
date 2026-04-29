<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useLibrariesQuery } from '@/queries/useLibrariesQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import EmptyState from '@/components/feedback/EmptyState.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import HomeHero from '../home/HomeHero.vue';
import type { Component } from '@/server-components/types';
import { focusedCardStore } from '@/stores/focusedCardStore';
import type { FocusedCardData } from '@/stores/focusedCardStore';

/*
 * Libraries view — same hero + rails composition as TvHomeScreen,
 * mirrors APK LibrariesScreen.kt.
 */

const containerEl = ref<HTMLElement | null>(null);
const railsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'libraries-rails',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge({ handle: railsGroup, containerEl });

const { data, isLoading, error, refetch, isFetching } = useLibrariesQuery();

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
	seedCard,
	(card) => {
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
	<div ref="containerEl" class="libraries nm-hero-rails-screen">
		<template v-if="error">
			<ErrorPanel
				:error="error as Error"
				:retry="() => refetch()"
				context="Couldn't load libraries"
			/>
		</template>
		<template v-else-if="isInitialLoad">
			<Skeleton type="rail" :count="6" />
			<Skeleton type="rail" :count="6" />
			<Skeleton type="rail" :count="6" />
		</template>
		<template v-else-if="components.length === 0">
			<EmptyState
				message="No libraries yet. Add one from your phone or desktop."
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
