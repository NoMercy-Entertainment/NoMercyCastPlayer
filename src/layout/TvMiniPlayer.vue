<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { playbackStore } from '@/stores/playbackStore';
import { buildImageUrl } from '@/lib/images/urls';

/*
 * Topnav now-playing tile. Mirrors APK TvMiniPlayer.kt — square cover
 * + title + artist on the left of the topnav when music is playing.
 * Click navigates to /now-playing.
 */

const router = useRouter();

const track = computed(() => playbackStore.music.track.value);
const isPlaying = computed(() => playbackStore.music.playing.value);
const coverUrl = computed(() => buildImageUrl(track.value?.cover ?? null, { width: 96 }));
const title = computed(() => track.value?.name ?? '');
const artist = computed(() => track.value?.artist ?? '');

const el = ref<HTMLElement | null>(null);
useFocusEntry({
	key: 'topnav-mini-player',
	el,
	onAction: () => {
		router.push('/now-playing');
	},
});
</script>

<template>
	<button
		v-if="track"
		ref="el"
		class="mini-player"
		data-focusable
		tabindex="0"
		:aria-label="`Now playing: ${title}`"
		@click.prevent="router.push('/now-playing')"
	>
		<div class="art">
			<img v-if="coverUrl" :src="coverUrl" :alt="title">
		</div>
		<div class="meta">
			<p class="title">
				{{ title }}
			</p>
			<p v-if="artist" class="artist">
				{{ artist }}
			</p>
		</div>
		<div class="indicator" :class="[{ playing: isPlaying }]">
			<svg
				v-if="isPlaying"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<rect x="6" y="4" width="4" height="16" />
				<rect x="14" y="4" width="4" height="16" />
			</svg>
			<svg
				v-else
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M8 5v14l11-7z" />
			</svg>
		</div>
	</button>
</template>

<style scoped>
.mini-player {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 4px 12px 4px 4px;
	background: rgba(0, 0, 0, 0.6);
	border: 2px solid transparent;
	border-radius: 24px;
	color: #fff;
	cursor: pointer;
	font-family: inherit;
	max-width: 280px;
	min-width: 0;
	outline: none;
	transition:
		border-color var(--motion-fast),
		transform var(--motion-fast);
}
.mini-player:focus-visible {
	border-color: var(--color-primary, oklch(0.7 0.2 285));
	transform: translateY(-1px);
}
.art {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	overflow: hidden;
	background: oklch(0.18 0.01 250);
	flex: 0 0 auto;
}
.art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.meta {
	min-width: 0;
	text-align: left;
}
.title {
	margin: 0;
	font-size: 12px;
	font-weight: 700;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
}
.artist {
	margin: 1px 0 0;
	font-size: 11px;
	color: oklch(0.85 0.005 250);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
}
.indicator {
	display: grid;
	place-items: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	flex: 0 0 auto;
}
.indicator.playing {
	color: var(--color-primary, oklch(0.7 0.2 285));
}
</style>
