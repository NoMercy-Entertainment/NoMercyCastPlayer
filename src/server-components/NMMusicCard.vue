<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';
import { buildImageUrl, SQUARE_SIZE } from '@/lib/images/urls';
import type { NMMusicCardWrapper, Update } from './types';

const props = defineProps<{
	id: string;
	data: NMMusicCardWrapper;
	update?: Update;
}>();

const router = useRouter();
const el = ref<HTMLElement | null>(null);
const cover = buildImageUrl(props.data.cover, SQUARE_SIZE);

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
	<article ref="el" class="music-card" data-focusable tabindex="0" role="button">
		<div class="cover">
			<img
				v-if="cover"
				:src="cover"
				:alt="props.data.name ?? ''"
				loading="lazy"
				decoding="async"
			>
			<FallbackPoster v-else :title="props.data.name" />
		</div>
		<div class="meta">
			<p class="name">
				{{ props.data.name }}
			</p>
			<p v-if="props.data.artist" class="artist">
				{{ props.data.artist }}
			</p>
		</div>
	</article>
</template>

<style scoped>
.music-card {
	flex: 0 0 var(--rail-card-width);
	width: var(--rail-card-width);
	display: flex;
	flex-direction: column;
	gap: 8px;
	border: 0;
	padding: 0;
	background: transparent;
	cursor: pointer;
	contain: layout paint;
	outline: none;
}
.cover {
	width: 100%;
	aspect-ratio: 1/1;
	border-radius: var(--radius-card);
	overflow: hidden;
	background: oklch(0.18 0.01 250);
}
.cover img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.name {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}
.artist {
	margin: 4px 0 0;
	font-size: 14px;
	color: var(--color-text-secondary);
}
</style>
