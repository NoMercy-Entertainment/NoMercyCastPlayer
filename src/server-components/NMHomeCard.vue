<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFocusEntry } from '@/composables/useFocusEntry'
import FallbackPoster from '@/components/cards/FallbackPoster.vue'
import { buildImageUrl, BACKDROP_SIZE } from '@/lib/images/urls'
import type { NMHomeCardWrapper, Update } from './types'

const props = defineProps<{
  id: string
  data: NMHomeCardWrapper
  update?: Update
}>()

const router = useRouter()
const el = ref<HTMLElement | null>(null)
const imageUrl = buildImageUrl(props.data.image, BACKDROP_SIZE)

useFocusEntry({
  key: props.id,
  el,
  onAction: () => {
    if (props.data.link) router.push(props.data.link)
  },
})

const progressPct =
  props.data.progress?.time && props.data.progress?.total
    ? Math.min(100, (props.data.progress.time / props.data.progress.total) * 100)
    : 0
</script>

<template>
  <article ref="el" class="home-card" data-focusable tabindex="0" role="button">
    <div class="art">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.data.title ?? ''"
        loading="lazy"
        decoding="async"
      />
      <FallbackPoster v-else :title="props.data.title" />
      <div v-if="progressPct > 0" class="progress" :style="{ width: `${progressPct}%` }" />
    </div>
    <div class="meta">
      <p v-if="props.data.show" class="show">{{ props.data.show }}</p>
      <p class="title">
        <span v-if="props.data.season">S{{ props.data.season }}</span>
        <span v-if="props.data.episode">E{{ props.data.episode }}</span>
        {{ props.data.title }}
      </p>
      <p v-if="props.data.subtitle" class="subtitle">{{ props.data.subtitle }}</p>
    </div>
  </article>
</template>

<style scoped>
.home-card {
  flex: 0 0 360px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  contain: layout paint;
  outline: none;
}
.art {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: oklch(0.18 0.01 250);
  position: relative;
}
.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.progress {
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  background: var(--color-accent);
}
.meta {
  padding: 0 4px;
}
.show {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.title {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
