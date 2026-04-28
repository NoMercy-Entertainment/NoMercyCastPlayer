import { ref, shallowRef } from 'vue'
import { TypedHub } from '@/lib/signalr/hubs'
import { buildHub, type HubName } from '@/lib/signalr/connection'
import type { RefreshLibraryPayload } from '@/lib/signalr/events'
import { invalidateAllLibrary, invalidateFromServer } from '@/queries/client'
import { authStore } from './authStore'

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

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

const connectionState = ref<ConnectionState>('idle')

const videoHub = shallowRef<TypedHub | null>(null)
const musicHub = shallowRef<TypedHub | null>(null)
const deviceHub = shallowRef<TypedHub | null>(null)

let stopRequested = false

async function startWithRetry(hub: TypedHub, name: HubName): Promise<void> {
  while (!stopRequested) {
    try {
      await hub.start()
      console.debug(`[socket] ${name} started`)
      return
    } catch (err) {
      console.warn(`[socket] ${name} start failed, retrying in 5s`, err)
      connectionState.value = 'reconnecting'
      await new Promise((r) => window.setTimeout(r, 5_000))
    }
  }
}

function bindRefreshLibrary(hub: TypedHub, name: HubName): void {
  hub.on('RefreshLibrary', (...args: unknown[]) => {
    const serverKey = args[0] as RefreshLibraryPayload | undefined
    if (Array.isArray(serverKey)) {
      console.debug(`[socket] ${name} RefreshLibrary`, serverKey)
      invalidateFromServer(serverKey)
    }
  })
}

function bindLifecycle(hub: TypedHub, name: HubName): void {
  const conn = hub.raw()
  conn.onreconnecting(() => {
    connectionState.value = 'reconnecting'
    console.debug(`[socket] ${name} reconnecting`)
  })
  conn.onreconnected(() => {
    connectionState.value = 'connected'
    console.debug(`[socket] ${name} reconnected — invalidating library cache`)
    invalidateAllLibrary()
  })
  conn.onclose((err) => {
    // With forever-retry, onclose only fires after explicit stop().
    console.debug(`[socket] ${name} closed`, err)
    if (stopRequested) connectionState.value = 'idle'
  })
}

export async function connectAll(): Promise<void> {
  if (!authStore.serverUrl.value || !authStore.accessToken.value) {
    console.warn('[socket] connectAll called without auth — skipping')
    return
  }
  stopRequested = false
  connectionState.value = 'connecting'

  videoHub.value = new TypedHub(buildHub('videoHub'))
  musicHub.value = new TypedHub(buildHub('musicHub'))
  deviceHub.value = new TypedHub(buildHub('deviceHub'))

  // RefreshLibrary handlers wire on every hub since each hub's queue
  // emits its own invalidations.
  bindRefreshLibrary(videoHub.value, 'videoHub')
  bindRefreshLibrary(musicHub.value, 'musicHub')
  bindRefreshLibrary(deviceHub.value, 'deviceHub')
  bindLifecycle(videoHub.value, 'videoHub')
  bindLifecycle(musicHub.value, 'musicHub')
  bindLifecycle(deviceHub.value, 'deviceHub')

  await Promise.all([
    startWithRetry(videoHub.value, 'videoHub'),
    startWithRetry(musicHub.value, 'musicHub'),
    startWithRetry(deviceHub.value, 'deviceHub'),
  ])

  connectionState.value = 'connected'
}

export async function disconnectAll(): Promise<void> {
  stopRequested = true
  await Promise.all(
    [videoHub.value, musicHub.value, deviceHub.value].map((h) =>
      h ? h.stop().catch(() => {}) : Promise.resolve(),
    ),
  )
  videoHub.value = null
  musicHub.value = null
  deviceHub.value = null
  connectionState.value = 'idle'
}

/** Foreground resume sweep wired to visibilitychange in main.ts. */
export function onForegroundResume(): void {
  if (connectionState.value === 'connected') {
    invalidateAllLibrary()
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
}
