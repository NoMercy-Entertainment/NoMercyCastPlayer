<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useSearchQuery } from '@/queries/useSearchQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import SearchKeyboard from './SearchKeyboard.vue';

const router = useRouter();
const containerEl = ref<HTMLElement | null>(null);
const screenGroup = useFocusGroup({
	type: 'horizontal',
	restorationKey: 'search-screen',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge(screenGroup);

const queryStr = ref('');
const debouncedQuery = ref('');
const mode = ref<'video' | 'music'>('video');

let debounceTimer: number | null = null;
watch(queryStr, (val) => {
	if (debounceTimer !== null)
		window.clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(() => {
		debouncedQuery.value = val;
	}, 250);
});

const queryType = computed(() => mode.value === 'music' ? 'music' : 'all');
const { data, isLoading, isFetching } = useSearchQuery(queryType, debouncedQuery);
const components = computed(() => data.value ?? []);

function appendLetter(l: string): void {
	queryStr.value += l;
}
function backspace(): void {
	queryStr.value = queryStr.value.slice(0, -1);
}
function space(): void {
	queryStr.value += ' ';
}
function setMode(next: 'video' | 'music'): void {
	mode.value = next;
}

function done(): void {
	const top = components.value[0];
	if (top && top.component === 'NMTopResultCard') {
		const link = (top.props as { link?: string }).link;
		if (link)
			router.push(link);
	}
}
</script>

<template>
	<div ref="containerEl" class="search">
		<aside class="left">
			<header class="query-bar">
				<span class="query-label">Search:</span>
				<span class="query-text">{{ queryStr || '_' }}</span>
			</header>
			<SearchKeyboard
				:mode="mode"
				@type="appendLetter"
				@backspace="backspace"
				@space="space"
				@mode="setMode"
			/>
			<button
				v-show="components.length > 0"
				class="done-btn"
				type="button"
				@click="done"
			>
				Open top result
			</button>
		</aside>
		<section class="right">
			<template v-if="!debouncedQuery">
				<p class="hint">
					Start typing to search.
				</p>
			</template>
			<template v-else-if="isLoading">
				<Skeleton type="rail" :count="6" />
			</template>
			<template v-else-if="components.length === 0">
				<p class="hint">
					No results for "{{ debouncedQuery }}".
				</p>
			</template>
			<template v-else>
				<Resolver
					v-for="c in components"
					:key="c.id"
					:component="c"
				/>
				<p v-if="isFetching" class="refresh-hint">
					Refreshing…
				</p>
			</template>
		</section>
	</div>
</template>

<style scoped>
/*
 * APK tv/SearchScreen.kt: 25 / 75 column split. Left column houses the
 * search bar + on-screen keyboard. Right column scrolls results.
 */
.search {
	display: grid;
	grid-template-columns: minmax(360px, 25%) 1fr;
	gap: 16px;
	padding: 64px 36px 24px;
	height: 100%;
}
.left {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.right {
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 24px;
	scrollbar-width: none;
}
.right::-webkit-scrollbar {
	display: none;
}
.query-bar {
	display: flex;
	align-items: baseline;
	gap: 16px;
	padding: 16px 24px;
	background: oklch(0.18 0.01 250);
	border-radius: 12px;
}
.query-label {
	color: var(--color-text-secondary);
	font-size: 14px;
}
.query-text {
	font-size: 28px;
	font-weight: 700;
	letter-spacing: 0.5px;
	font-variant-numeric: tabular-nums;
}
.hint {
	color: var(--color-text-secondary);
	font-size: 18px;
}
.refresh-hint {
	color: var(--color-text-secondary);
	font-size: 13px;
}
.done-btn {
	font: inherit;
	border: 0;
	background: oklch(0.18 0.02 250);
	color: var(--color-text-primary);
	padding: 12px 16px;
	border-radius: 12px;
	cursor: pointer;
}
.done-btn:focus-visible {
	background: var(--color-primary, oklch(0.7 0.2 285));
	color: oklch(0.18 0.02 35);
}
</style>
