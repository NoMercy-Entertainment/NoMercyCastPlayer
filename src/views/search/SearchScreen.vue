<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { useSearchQuery } from '@/queries/useSearchQuery';
import Resolver from '@/server-components/Resolver.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import SearchKeyboard from './SearchKeyboard.vue';

const router = useRouter();
const containerEl = ref<HTMLElement | null>(null);
useFocusGroup({
	type: 'horizontal',
	restorationKey: 'search-screen',
	containerEl,
});

const queryStr = ref('');
const debouncedQuery = ref('');
const type = ref('all');

let debounceTimer: number | null = null;
watch(queryStr, (val) => {
	if (debounceTimer !== null)
		window.clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(() => {
		debouncedQuery.value = val;
	}, 250);
});

const { data, isLoading, isFetching } = useSearchQuery(type, debouncedQuery);
const components = computed(() => data.value ?? []);

function appendLetter(l: string): void {
	queryStr.value += l;
}
function backspace(): void {
	queryStr.value = queryStr.value.slice(0, -1);
}
function clearAll(): void {
	queryStr.value = '';
	debouncedQuery.value = '';
}
function space(): void {
	queryStr.value += ' ';
}
function done(): void {
	// If there's a top result, navigate to it.
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
				@type="appendLetter"
				@backspace="backspace"
				@clear="clearAll"
				@space="space"
				@done="done"
			/>
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
 * APK SearchScreen.kt uses a 25 / 75 column split with the keyboard on the
 * left and results filling the right. Padding 36dp horizontal, 64dp top.
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
</style>
