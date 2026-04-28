<script setup lang="ts">
import { ref } from 'vue'
import { useFocusGroup } from '@/composables/useFocusGroup'
import MusicPlayer from '@/players/music/MusicPlayer.vue'
import NowPlayingHero from '@/players/music/NowPlayingHero.vue'
import ProgressControls from '@/players/music/ProgressControls.vue'
import QueuePeek from '@/players/music/QueuePeek.vue'
import { playbackStore } from '@/stores/playbackStore'
import { buildImageUrl } from '@/lib/images/urls'

const containerEl = ref<HTMLElement | null>(null)
useFocusGroup({
  type: 'vertical',
  restorationKey: 'now-playing',
  containerEl,
})

const track = playbackStore.music.track
function backdropFor(): string | null {
  if (!track.value?.cover) return null
  return buildImageUrl(track.value.cover, { width: 1280, height: 1280 })
}
</script>

<template>
  <MusicPlayer>
    <div ref="containerEl" class="now-playing">
      <div
        v-if="backdropFor()"
        class="art-backdrop"
        :style="{ backgroundImage: `url(${backdropFor()})` }"
      />
      <div class="art-scrim" />
      <div class="content">
        <div class="left">
          <NowPlayingHero />
          <ProgressControls />
        </div>
        <div class="right">
          <QueuePeek />
        </div>
      </div>
    </div>
  </MusicPlayer>
</template>

<style scoped>
.now-playing {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.art-backdrop {
  position: absolute;
  inset: -10%;
  background-size: cover;
  background-position: center;
  filter: blur(48px) brightness(0.4);
  z-index: 0;
}
.art-scrim {
  position: absolute;
  inset: 0;
  background: oklch(0 0 0 / 0.4);
  z-index: 1;
}
.content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  padding: 48px var(--tv-safe-padding);
  height: 100%;
  align-items: center;
}
.left {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}
.right {
  align-self: end;
  padding-bottom: 32px;
}
</style>
