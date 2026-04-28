<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { buildImageUrl } from '@/lib/images/urls';
import type { NMTrackRowWrapper, Update } from './types';

const props = defineProps<{
	id: string;
	data: NMTrackRowWrapper;
	update?: Update;
}>();

const router = useRouter();
const el = ref<HTMLElement | null>(null);
const cover = buildImageUrl(props.data.cover, { width: 64, height: 64 });

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
	<article ref="el" class="track-row" data-focusable tabindex="0" role="button">
		<span class="position">{{ props.data.position ?? '' }}</span>
		<img v-if="cover" :src="cover" :alt="props.data.name" class="cover">
		<div class="meta">
			<p class="name">
				{{ props.data.name }}
			</p>
			<p v-if="props.data.artist" class="artist">
				{{ props.data.artist }}
			</p>
		</div>
		<span v-if="props.data.duration" class="duration">{{ props.data.duration }}</span>
	</article>
</template>

<style scoped>
.track-row {
	display: grid;
	grid-template-columns: 32px 64px 1fr auto;
	align-items: center;
	gap: 16px;
	padding: 8px 16px;
	border: 0;
	background: transparent;
	cursor: pointer;
	border-radius: 8px;
	outline: none;
	text-align: start;
	width: 100%;
}
.position {
	color: var(--color-text-secondary);
	font-variant-numeric: tabular-nums;
	text-align: end;
}
.cover {
	width: 48px;
	height: 48px;
	border-radius: 8px;
	object-fit: cover;
}
.name {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}
.artist {
	margin: 2px 0 0;
	font-size: 14px;
	color: var(--color-text-secondary);
}
.duration {
	color: var(--color-text-secondary);
	font-variant-numeric: tabular-nums;
}
</style>
