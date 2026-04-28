<script setup lang="ts">
import { socketStore } from '@/stores/socketStore'
import { computed } from 'vue'

const stateLabel = computed(() => {
  switch (socketStore.connectionState.value) {
    case 'connecting':
      return 'Connecting…'
    case 'reconnecting':
      return 'Reconnecting…'
    case 'connected':
      return 'Connected'
    case 'failed':
      return 'Disconnected'
    default:
      return ''
  }
})

const isReconnecting = computed(() =>
  ['connecting', 'reconnecting'].includes(socketStore.connectionState.value),
)
</script>

<template>
  <div v-if="stateLabel" :class="['pill', { reconnecting: isReconnecting }]">
    <span class="dot" />
    {{ stateLabel }}
  </div>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: oklch(1 0 0 / 0.08);
  border-radius: 999px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(0.7 0.15 145);
}
.reconnecting .dot {
  background: oklch(0.7 0.18 70);
}
</style>
