<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';
import { buildImageUrl, SQUARE_SIZE } from '@/lib/images/urls';
import type { NMTopResultCardWrapper, Update } from './types';

const props = defineProps<{
	id: string;
	data: NMTopResultCardWrapper;
	update?: Update;
}>();

const router = useRouter();
const el = ref<HTMLElement | null>(null);
const image = buildImageUrl(props.data.image, SQUARE_SIZE);

useFocusEntry({
	key: props.id,
	el,
	onAction: () => {
		if (props.data.link)
			router.push(props.data.link);
	},
});
</script>

<template>
	<article ref="el" class="top-result" data-focusable tabindex="0" role="button">
		<div class="art">
			<img v-if="image" :src="image" :alt="props.data.title">
			<FallbackPoster v-else :title="props.data.title" />
		</div>
		<div class="meta">
			<p v-if="props.data.type" class="kind">
				{{ props.data.type }}
			</p>
			<h3 class="title">
				{{ props.data.title }}
			</h3>
			<p v-if="props.data.subtitle" class="subtitle">
				{{ props.data.subtitle }}
			</p>
		</div>
	</article>
</template>

<style scoped>
.top-result {
	display: grid;
	grid-template-columns: 200px 1fr;
	gap: 24px;
	padding: 24px;
	border: 0;
	background: oklch(0.18 0.01 250);
	border-radius: var(--radius-card);
	cursor: pointer;
	outline: none;
	text-align: start;
}
.art {
	width: 200px;
	height: 200px;
	border-radius: var(--radius-card);
	overflow: hidden;
}
.art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.kind {
	margin: 0;
	font-size: 14px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--color-text-secondary);
}
.title {
	margin: 8px 0 0;
	font-size: 32px;
	font-weight: 700;
}
.subtitle {
	margin: 8px 0 0;
	font-size: 16px;
	color: var(--color-text-secondary);
}
</style>
