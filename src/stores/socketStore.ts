import { ref, shallowRef } from 'vue';
import { TypedHub } from '@/lib/signalr/hubs';
import { buildHub } from '@/lib/signalr/connection';
import type { HubName } from '@/lib/signalr/connection';
import type { MusicPlayerStateMsg, RefreshLibraryPayload, VideoPlayerStateMsg } from '@/lib/signalr/events';
import { invalidateAllLibrary, invalidateFromServer } from '@/lib/queryShim';
import { playbackStore } from './playbackStore';
import type { ConnectedDeviceSnapshot } from './playbackStore';
import { authStore } from './authStore';

/**
 * SignalR lifecycle store per spec §9.5.
 *
 * - Three hubs: video / music / device
 * - Bootstrap retry: each hub's initial start() loops every 5s until success
 *   (server may still be rebooting after a deploy)
 * - Forever-retry policy on the connection itself handles mid-session
 *   disconnects in the background — UI shows "reconnecting…" but state
 *   preserved
 * - onreconnected fires invalidateAllLibrary to catch missed RefreshLibrary
 *   events while disconnected
 * - DEGRADED is owned by authStore; SignalR-only failures never trigger it
 */

export type ConnectionState
	= | 'idle'
		| 'connecting'
		| 'connected'
		| 'reconnecting'
		| 'failed';

const connectionState = ref<ConnectionState>('idle');

const videoHub = shallowRef<TypedHub | null>(null);
const musicHub = shallowRef<TypedHub | null>(null);
const deviceHub = shallowRef<TypedHub | null>(null);

let stopRequested = false;

async function startWithRetry(hub: TypedHub, name: HubName): Promise<void> {
	// stopRequested is mutated by disconnectAll() outside this loop —
	// ESLint's static analysis can't follow async cross-call mutation.
	// eslint-disable-next-line no-unmodified-loop-condition
	while (!stopRequested) {
		try {
			await hub.start();
			console.debug(`[socket] ${name} started`);
			return;
		}
		catch (err) {
			console.warn(`[socket] ${name} start failed, retrying in 5s`, err);
			connectionState.value = 'reconnecting';
			await new Promise(r => window.setTimeout(r, 5_000));
		}
	}
}

function bindRefreshLibrary(hub: TypedHub, name: HubName): void {
	hub.on('RefreshLibrary', (...args: unknown[]) => {
		const serverKey = args[0] as RefreshLibraryPayload | undefined;
		if (Array.isArray(serverKey)) {
			console.debug(`[socket] ${name} RefreshLibrary`, serverKey);
			invalidateFromServer(serverKey);
		}
	});
}

function bindDeviceList(hub: TypedHub): void {
	hub.on('DeviceListChanged', (...args: unknown[]) => {
		const devices = (args[0] ?? []) as ConnectedDeviceSnapshot[];
		playbackStore.devices.applyAccountDevices(devices);
	});
}

/**
 * Applies MusicPlayerState/VideoPlayerState/ConnectedDevicesState directly
 * into playbackStore, bound at hub-creation time rather than from within
 * the music/video engine bridges — those bridges attach only once their
 * npm player package finishes loading, well after the hub's initial
 * post-connect state push, which otherwise arrives to zero listeners.
 */
function bindMusicPlayerState(hub: TypedHub): void {
	hub.on('MusicPlayerState', (...args: unknown[]) => {
		const state = args[0] as MusicPlayerStateMsg | undefined;
		if (!state)
			return;
		if (state.current_item) {
			playbackStore.music.applyTrack(
				{
					id: String(state.current_item.id),
					name: state.current_item.name,
					artist: state.current_item.artist,
					cover: state.current_item.cover,
					duration_ms: state.current_item.duration ? Number(state.current_item.duration) * 1000 : undefined,
					favorite: false,
				},
				playbackStore.music.queue.value,
			);
		}
		if (typeof state.play_state === 'boolean')
			playbackStore.music.applyPlayState(state.play_state);
		if (typeof state.time === 'number')
			playbackStore.music.applyTime(Math.round(state.time));
	});
}

function bindVideoPlayerState(hub: TypedHub): void {
	hub.on('VideoPlayerState', (...args: unknown[]) => {
		const state = args[0] as VideoPlayerStateMsg | undefined;
		if (!state)
			return;
		if (state.current_item) {
			playbackStore.video.applyState({
				type: 'movie',
				id: String(state.current_item.id),
				title: state.current_item.title,
				duration_ms: state.current_item.duration ? Number(state.current_item.duration) * 1000 : undefined,
			});
		}
		if (typeof state.play_state === 'boolean')
			playbackStore.video.applyPlayState(state.play_state);
		if (typeof state.time === 'number')
			playbackStore.video.applyTime(Math.round(state.time));
	});
}

function bindConnectedDevices(hub: TypedHub): void {
	hub.on('ConnectedDevicesState', (...args: unknown[]) => {
		const devices = (args[0] ?? []) as ConnectedDeviceSnapshot[];
		playbackStore.music.applyConnectedDevices(devices);
	});
}

function bindLifecycle(hub: TypedHub, name: HubName): void {
	const conn = hub.raw();
	conn.onreconnecting(() => {
		connectionState.value = 'reconnecting';
		console.debug(`[socket] ${name} reconnecting`);
	});
	conn.onreconnected(() => {
		connectionState.value = 'connected';
		console.debug(`[socket] ${name} reconnected — invalidating library cache`);
		invalidateAllLibrary();
	});
	conn.onclose((err) => {
		// With forever-retry, onclose only fires after explicit stop().
		console.debug(`[socket] ${name} closed`, err);
		if (stopRequested)
			connectionState.value = 'idle';
	});
}

export async function connectAll(): Promise<void> {
	if (!authStore.serverUrl.value || !authStore.accessToken.value) {
		console.warn('[socket] connectAll called without auth — skipping');
		return;
	}
	stopRequested = false;
	connectionState.value = 'connecting';

	videoHub.value = new TypedHub(buildHub('videoHub'));
	musicHub.value = new TypedHub(buildHub('musicHub'));
	deviceHub.value = new TypedHub(buildHub('deviceHub'));

	// RefreshLibrary handlers wire on every hub since each hub's queue
	// emits its own invalidations.
	bindRefreshLibrary(videoHub.value, 'videoHub');
	bindRefreshLibrary(musicHub.value, 'musicHub');
	bindRefreshLibrary(deviceHub.value, 'deviceHub');
	bindDeviceList(deviceHub.value);
	bindMusicPlayerState(musicHub.value);
	bindConnectedDevices(musicHub.value);
	bindVideoPlayerState(videoHub.value);
	bindLifecycle(videoHub.value, 'videoHub');
	bindLifecycle(musicHub.value, 'musicHub');
	bindLifecycle(deviceHub.value, 'deviceHub');

	await Promise.all([
		startWithRetry(videoHub.value, 'videoHub'),
		startWithRetry(musicHub.value, 'musicHub'),
		startWithRetry(deviceHub.value, 'deviceHub'),
	]);

	connectionState.value = 'connected';
}

export async function disconnectAll(): Promise<void> {
	stopRequested = true;
	await Promise.all(
		[videoHub.value, musicHub.value, deviceHub.value].map(h =>
			h ? h.stop().catch(() => {}) : Promise.resolve(),
		),
	);
	videoHub.value = null;
	musicHub.value = null;
	deviceHub.value = null;
	connectionState.value = 'idle';
}

/** Foreground resume sweep wired to visibilitychange in main.ts. */
export function onForegroundResume(): void {
	if (connectionState.value === 'connected') {
		invalidateAllLibrary();
	}
}

export const socketStore = {
	connectionState,
	videoHub,
	musicHub,
	deviceHub,
	connectAll,
	disconnectAll,
	onForegroundResume,
};
