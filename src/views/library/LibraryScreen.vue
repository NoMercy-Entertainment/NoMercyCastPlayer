<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useAutoRetry } from '@/composables/useAutoRetry';
import { useHeroSeed } from '@/composables/useHeroSeed';
import { useLibraryQuery } from '@/queries/useLibraryQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import EmptyState from '@/components/feedback/EmptyState.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import HomeHero from '../home/HomeHero.vue';
import type { Component } from '@/server-components/types';
import { focusedCardStore } from '@/stores/focusedCardStore';

/*
 * Library drilldown view — used for /libraries/:id, /genres/:id,
 * /collection, /specials. Same hero + rails composition as
 * TvLibraryScreen.kt.
 */

const LEADING_SLASH = /^\//;
const route = useRoute();
const path = computed(() => route.fullPath.replace(LEADING_SLASH, '').split('?')[0]);

const containerEl = ref<HTMLElement | null>(null);
const railsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'library-rails',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});
useNavFocusBridge({ handle: railsGroup, containerEl });

const { data, isLoading, error, refetch, isFetching } = useLibraryQuery(path);

const isInitialLoad = computed(() => isLoading.value && !data.value);
const components = computed<Component[]>(() => data.value ?? []);

useHeroSeed(components);
useAutoRetry({ error, refetch });

const heroCard = computed(() => focusedCardStore.debouncedCard.value);
</script>

<template>
	<div ref="containerEl" class="library nm-hero-rails-screen">
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
