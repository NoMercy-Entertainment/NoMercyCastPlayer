<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useAutoRetry } from '@/composables/useAutoRetry';
import { useHeroSeed } from '@/composables/useHeroSeed';
import { useHomeQuery } from '@/queries/useHomeQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import EmptyState from '@/components/feedback/EmptyState.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import HomeHero from './HomeHero.vue';
import type { Component } from '@/server-components/types';
import { focusedCardStore } from '@/stores/focusedCardStore';

/*
 * Mirrors APK TvHomeScreen.kt — fixed hero region pinned to the top
 * of the viewport, rails laid below it. useHeroSeed seeds the
 * focused-card store from the first usable carousel item, useAutoRetry
 * keeps the home query refetching while it's in an error state.
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

useHeroSeed(components);
useAutoRetry({ error, refetch });

const heroCard = computed(() => focusedCardStore.debouncedCard.value);
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
