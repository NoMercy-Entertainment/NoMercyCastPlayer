<script setup lang="ts">
import { ref } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import Resolver from './Resolver.vue';
import type { NMGridWrapper, Update } from './types';

const props = defineProps<{
	id: string;
	data: NMGridWrapper;
	update?: Update;
}>();

const containerEl = ref<HTMLElement | null>(null);
const columns = (props.data.properties?.columns as number | undefined) ?? 6;

useFocusGroup({
	type: 'grid',
	restorationKey: `grid-${props.id}`,
	columns,
	containerEl,
});
</script>

<template>
	<section v-if="props.data.items?.length" class="grid-section" :data-grid-id="id">
		<header v-if="props.data.title" class="grid-header">
			<h2>{{ props.data.title }}</h2>
			<a v-if="props.data.more_link" :href="props.data.more_link" class="more-link">
				{{ props.data.more_link_text || 'More' }}
			</a>
		</header>

		<div ref="containerEl" class="grid-track" :style="{ '--cols': columns }">
			<Resolver v-for="item in props.data.items" :key="item.id" :component="item" />
		</div>
	</section>
</template>

<style scoped>
.grid-section {
	display: flex;
	flex-direction: column;
	contain: layout paint;
	padding-block-end: 32px;
}
.grid-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	padding: 0 var(--tv-safe-padding);
}
.grid-header h2 {
	margin: 0;
	font-size: 24px;
	font-weight: 600;
}
.grid-track {
	display: grid;
	grid-template-columns: repeat(var(--cols), 1fr);
	gap: var(--rail-card-gap);
	padding: 16px var(--tv-safe-padding);
}
.more-link {
	font-size: 16px;
	color: var(--color-text-secondary);
	text-decoration: none;
}
</style>
