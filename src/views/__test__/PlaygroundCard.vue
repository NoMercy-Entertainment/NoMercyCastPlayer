<script setup lang="ts">
import { ref } from 'vue'
import { useFocusEntry } from '@/composables/useFocusEntry'

const props = defineProps<{
  rowId: string
  idx: number
  onAction: (line: string) => void
}>()

const el = ref<HTMLElement | null>(null)
const key = `${props.rowId}-card-${props.idx}`

useFocusEntry({
  key,
  el,
  onAction: () => props.onAction(`Action: ${key}`),
})
</script>

<template>
  <div ref="el" class="card" data-focusable tabindex="0">
    {{ key }}
  </div>
</template>

<style scoped>
.card {
  flex: 0 0 240px;
  height: 160px;
  display: grid;
  place-items: center;
  background: oklch(0.22 0.02 250);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  contain: layout paint;
  outline: none;
}
</style>
