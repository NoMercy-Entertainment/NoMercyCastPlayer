<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { playbackStore } from '@/stores/playbackStore';
import { musicSyncBridge } from './syncBridge';

const containerEl = ref<HTMLElement | null>(null);
useFocusGroup({
	type: 'horizontal',
	restorationKey: 'now-playing-controls',
	initialFocusKey: 'np-play',
	containerEl,
});

const prevEl = ref<HTMLElement | null>(null);
const playEl = ref<HTMLElement | null>(null);
const nextEl = ref<HTMLElement | null>(null);

useFocusEntry({
	key: 'np-prev',
	el: prevEl,
	onAction: () => musicSyncBridge.current()?.previous(),
});
useFocusEntry({
	key: 'np-play',
	el: playEl,
	onAction: () => {
		const e = musicSyncBridge.current();
		if (!e)
			return;
		if (playbackStore.music.playing.value)
			e.pause();
		else e.play();
	},
});
useFocusEntry({
	key: 'np-next',
	el: nextEl,
	onAction: () => musicSyncBridge.current()?.next(),
});

const playing = playbackStore.music.playing;
const time = playbackStore.music.timeMs;
const track = playbackStore.music.track;
const totalMs = computed(() => track.value?.duration_ms ?? 0);
const pct = computed(() => {
	if (!totalMs.value)
		return 0;
	return Math.min(100, (time.value / totalMs.value) * 100);
});

function fmt(ms: number): string {
	const total = Math.max(0, Math.round(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}
</script>

<template>
	<div class="controls">
		<div class="progress-row">
			<span class="time">{{ fmt(time) }}</span>
			<div class="bar">
				<div class="fill" :style="{ width: `${pct}%` }" />
			</div>
			<span class="time">{{ fmt(totalMs) }}</span>
		</div>
		<div ref="containerEl" class="buttons">
			<button ref="prevEl" data-focusable tabindex="0" class="ctrl-btn">
				⏮
			</button>
			<button ref="playEl" data-focusable tabindex="0" class="ctrl-btn ctrl-play">
				{{ playing ? '⏸' : '▶' }}
			</button>
			<button ref="nextEl" data-focusable tabindex="0" class="ctrl-btn">
				⏭
			</button>
		</div>
	</div>
</template>

<style scoped>
.controls {
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 600px;
	margin: 0 auto;
}
.progress-row {
	display: grid;
	grid-template-columns: 64px 1fr 64px;
	align-items: center;
	gap: 16px;
}
.time {
	font-size: 14px;
	color: var(--color-text-secondary);
	font-variant-numeric: tabular-nums;
	text-align: center;
}
.bar {
	height: 4px;
	background: oklch(1 0 0 / 0.12);
	border-radius: 999px;
	overflow: hidden;
}
.fill {
	height: 100%;
	background: var(--color-accent);
	transition: width 200ms linear;
}
.buttons {
	display: flex;
	gap: 16px;
	justify-content: center;
}
.ctrl-btn {
	width: 64px;
	height: 64px;
	border: 0;
	border-radius: 50%;
	background: oklch(1 0 0 / 0.08);
	color: var(--color-text-primary);
	font-size: 24px;
	cursor: pointer;
	outline: none;
}
.ctrl-play {
	width: 80px;
	height: 80px;
	background: var(--color-accent);
	color: oklch(0.18 0.02 35);
	font-size: 32px;
}
.ctrl-btn:focus-visible {
	transform: scale(1.08);
}
</style>
