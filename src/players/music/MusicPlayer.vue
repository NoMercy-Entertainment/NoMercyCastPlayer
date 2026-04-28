<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { musicSyncBridge } from './syncBridge';
import { authStore } from '@/stores/authStore';

/**
 * Headless music engine wrapper. The
 * @nomercy-entertainment/nomercy-music-player package is event-driven
 * with no UI; we attach our sync bridge and let NowPlayingHero +
 * ProgressControls + QueuePeek render off the playbackStore the bridge
 * keeps fresh.
 *
 * audiomotion-analyzer is an optional peer dep we deliberately skip per
 * spec §12.7 — visualizations are too expensive on weak Cast hardware.
 *
 * Engine lifecycle: created on mount, disposed on unmount. NowPlaying
 * route exists inside KeepAlive(:max=6) so disposal only happens when
 * the cast session unloads or the user navigates past 6 pages.
 */

let engine: { dispose?: () => void } | null = null;

onMounted(async () => {
	try {
		const mod = await import('@nomercy-entertainment/nomercy-music-player');
		const Ctor
			= (mod as { default?: new (opts: unknown) => unknown }).default
				?? (mod as { MusicPlayer?: new (opts: unknown) => unknown }).MusicPlayer;
		if (typeof Ctor !== 'function') {
			console.warn('[music-player] no constructor exported from package');
			return;
		}
		engine = new Ctor({
			siteTitle: 'NoMercy',
			baseUrl: authStore.serverUrl.value ?? '',
			expose: false,
			disableAutoPlayback: false,
		}) as { dispose?: () => void };
		musicSyncBridge.attach(engine as never);
	}
	catch (err) {
		console.error('[music-player] init failed', err);
	}
});

onBeforeUnmount(() => {
	musicSyncBridge.detach();
	engine?.dispose?.();
	engine = null;
});
</script>

<template>
	<slot />
</template>
