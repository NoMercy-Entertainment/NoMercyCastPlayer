import { ref } from 'vue'

/**
 * Receiver-side playback store. Reactive snapshot of the music + video
 * engine state, consumed by Now Playing / Watch UI and the SignalR sync
 * bridges. Phase 8 wires the music slice; Phase 9 adds the video slice.
 *
 * Engine instances aren't stored here directly to keep this layer free
 * of npm-package types — the bridge files own the engine and forward
 * state changes through these refs.
 */

export interface CurrentTrackSnapshot {
  id: string
  name: string
  artist?: string
  album?: string
  cover?: string
  duration_ms?: number
}

export interface CurrentVideoSnapshot {
  type: 'movie' | 'tv'
  id: string
  title: string
  duration_ms?: number
}

const musicTrack = ref<CurrentTrackSnapshot | null>(null)
const musicQueue = ref<CurrentTrackSnapshot[]>([])
const musicTimeMs = ref<number>(0)
const musicPlaying = ref<boolean>(false)
const musicVolume = ref<number>(100)

const videoItem = ref<CurrentVideoSnapshot | null>(null)
const videoTimeMs = ref<number>(0)
const videoPlaying = ref<boolean>(false)

function applyMusicTime(ms: number): void {
  musicTimeMs.value = ms
}

function applyMusicTrack(track: CurrentTrackSnapshot | null, queue: CurrentTrackSnapshot[]): void {
  musicTrack.value = track
  musicQueue.value = queue
}

function applyMusicPlayState(playing: boolean): void {
  musicPlaying.value = playing
}

function applyVideoState(snapshot: CurrentVideoSnapshot | null): void {
  videoItem.value = snapshot
}

function applyVideoTime(ms: number): void {
  videoTimeMs.value = ms
}

function applyVideoPlayState(playing: boolean): void {
  videoPlaying.value = playing
}

export const playbackStore = {
  music: {
    track: musicTrack,
    queue: musicQueue,
    timeMs: musicTimeMs,
    playing: musicPlaying,
    volume: musicVolume,
    applyTrack: applyMusicTrack,
    applyTime: applyMusicTime,
    applyPlayState: applyMusicPlayState,
  },
  video: {
    item: videoItem,
    timeMs: videoTimeMs,
    playing: videoPlaying,
    applyState: applyVideoState,
    applyTime: applyVideoTime,
    applyPlayState: applyVideoPlayState,
  },
}
