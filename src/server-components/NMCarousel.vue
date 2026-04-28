<script setup lang="ts">
import { ref } from 'vue'
import { useFocusGroup } from '@/composables/useFocusGroup'
import HorizontalRail from '@/components/rails/HorizontalRail.vue'
import Resolver from './Resolver.vue'
import type { NMCarouselWrapper, Update } from './types'

const props = defineProps<{
  id: string
  data: NMCarouselWrapper
  update?: Update
}>()

const containerEl = ref<HTMLElement | null>(null)

function captureRail(instance: unknown): void {
  const track = (instance as { trackEl?: HTMLElement | null } | null)?.trackEl
  containerEl.value = track ?? null
}

useFocusGroup({
  type: 'horizontal',
  restorationKey: `carousel-${props.id}`,
  containerEl,
})
</script>

<template>
  <section v-if="props.data.items?.length" class="rail-section" :data-rail-id="id">
    <header v-if="props.data.title" class="rail-header">
      <h2>{{ props.data.title }}</h2>
      <a v-if="props.data.more_link" :href="props.data.more_link" class="more-link">
        {{ props.data.more_link_text || 'More' }}
      </a>
    </header>

    <HorizontalRail :ref="captureRail">
      <Resolver
        v-for="item in props.data.items"
        :key="item.id"
        :component="item"
      />
    </HorizontalRail>
  </section>
</template>

<style scoped>
.rail-section {
  display: flex;
  flex-direction: column;
  contain: layout paint;
}
.rail-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 var(--tv-safe-padding);
}
.rail-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.more-link {
  font-size: 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
}
</style>
