<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFocusGroup } from '@/composables/useFocusGroup'
import { useHomeQuery } from '@/queries/useHomeQuery'
import Resolver from '@/server-components/Resolver.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorPanel from '@/components/feedback/ErrorPanel.vue'

const containerEl = ref<HTMLElement | null>(null)
useFocusGroup({
  type: 'vertical',
  restorationKey: 'home-rails',
  containerEl,
})

const { data, isLoading, error, refetch, isFetching } = useHomeQuery()

const isInitialLoad = computed(() => isLoading.value && !data.value)
const components = computed(() => data.value ?? [])
</script>

<template>
  <div ref="containerEl" class="home">
    <template v-if="error">
      <ErrorPanel
        :error="error as Error"
        :retry="() => refetch()"
        context="Couldn't load home"
      />
    </template>
    <template v-else-if="isInitialLoad">
      <Skeleton type="rail" :count="4" />
      <Skeleton type="rail" :count="6" />
      <Skeleton type="rail" :count="6" />
    </template>
    <template v-else-if="components.length === 0">
      <EmptyState
        message="Your home is empty. Add a library on your phone or desktop to get started."
        :action="{ label: 'Refresh', onAction: () => refetch() }"
      />
    </template>
    <template v-else>
      <Resolver
        v-for="component in components"
        :key="component.id"
        :component="component"
      />
      <p v-if="isFetching" class="refresh-hint">Refreshing…</p>
    </template>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px 0 64px;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.home::-webkit-scrollbar {
  display: none;
}
.refresh-hint {
  position: fixed;
  inset: auto auto 16px 50%;
  transform: translateX(-50%);
  background: oklch(1 0 0 / 0.08);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
