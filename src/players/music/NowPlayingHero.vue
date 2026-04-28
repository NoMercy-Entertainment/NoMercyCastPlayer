<script setup lang="ts">
import { computed } from 'vue';
import { playbackStore } from '@/stores/playbackStore';
import { buildImageUrl } from '@/lib/images/urls';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';

const track = playbackStore.music.track;
const cover = computed(() =>
	track.value?.cover ? buildImageUrl(track.value.cover, { width: 800, height: 800 }) : null,
);
</script>

<template>
	<div class="hero">
		<div class="art">
			<img v-if="cover" :src="cover" :alt="track?.name ?? ''" decoding="async">
			<FallbackPoster v-else :title="track?.name" />
		</div>
		<div class="meta">
			<h1 class="title">
				{{ track?.name ?? '—' }}
			</h1>
			<p v-if="track?.artist" class="artist">
				{{ track.artist }}
			</p>
			<p v-if="track?.album" class="album">
				{{ track.album }}
			</p>
		</div>
	</div>
</template>

<style scoped>
.hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 32px;
}
.art {
	width: 480px;
	height: 480px;
	border-radius: 24px;
	overflow: hidden;
	box-shadow: 0 24px 64px oklch(0 0 0 / 0.5);
}
.art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.meta {
	text-align: center;
}
.title {
	margin: 0;
	font-size: 40px;
	font-weight: 700;
	letter-spacing: -1px;
}
.artist {
	margin: 8px 0 0;
	font-size: 24px;
	color: var(--color-text-secondary);
}
.album {
	margin: 8px 0 0;
	font-size: 18px;
	color: var(--color-text-secondary);
}
</style>
