<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';
import { buildImageUrl, POSTER_SIZE } from '@/lib/images/urls';
import type { NMCardWrapper, Update } from './types';

const props = defineProps<{
	id: string;
	data: NMCardWrapper;
	update?: Update;
}>();

const router = useRouter();
const el = ref<HTMLElement | null>(null);
const imageUrl = buildImageUrl(props.data.image, POSTER_SIZE);

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
	<article ref="el" class="card" data-focusable tabindex="0" role="button">
		<div class="poster">
			<img
				v-if="imageUrl"
				:src="imageUrl"
				:alt="props.data.title ?? ''"
				loading="lazy"
				decoding="async"
			>
			<FallbackPoster v-else :title="props.data.title" />
		</div>
		<div class="meta">
			<p class="title">
				{{ props.data.title }}
			</p>
			<p v-if="props.data.subtitle" class="subtitle">
				{{ props.data.subtitle }}
			</p>
		</div>
	</article>
</template>

<style scoped>
.card {
	flex: 0 0 var(--rail-card-width);
	width: var(--rail-card-width);
	display: flex;
	flex-direction: column;
	gap: 8px;
	border: 0;
	background: transparent;
	padding: 0;
	cursor: pointer;
	contain: layout paint;
	outline: none;
}
.poster {
	width: 100%;
	aspect-ratio: 2/3;
	border-radius: var(--radius-card);
	overflow: hidden;
	background: oklch(0.18 0.01 250);
}
.poster img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.meta {
	padding: 0 4px;
}
.title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	line-height: 1.2;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}
.subtitle {
	margin: 4px 0 0;
	font-size: 14px;
	color: var(--color-text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
