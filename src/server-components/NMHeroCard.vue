<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFocusEntry } from '@/composables/useFocusEntry'
import FallbackPoster from '@/components/cards/FallbackPoster.vue'
import { buildImageUrl, BACKDROP_SIZE } from '@/lib/images/urls'
import type { NMCardWrapper, Update } from './types'

const props = defineProps<{
  id: string
  data: NMCardWrapper
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
</script>

<template>
  <article ref="el" class="hero-card" data-focusable tabindex="0" role="button">
    <div class="art">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.data.title ?? ''"
        loading="lazy"
        decoding="async"
      />
      <FallbackPoster v-else :title="props.data.title" />
    </div>
    <div class="meta">
      <p class="title">{{ props.data.title }}</p>
      <p v-if="props.data.subtitle" class="subtitle">{{ props.data.subtitle }}</p>
    </div>
  </article>
</template>

<style scoped>
.hero-card {
  flex: 0 0 480px;
  width: 480px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  contain: layout paint;
  outline: none;
}
.art {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
