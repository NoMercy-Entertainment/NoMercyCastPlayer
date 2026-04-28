<script setup lang="ts">
import { ref } from 'vue'
import { useFocusEntry } from '@/composables/useFocusEntry'

const props = defineProps<{
  focusKey: string
  label: string
  path: string
  active: boolean
}>()

const emit = defineEmits<{ action: [path: string] }>()

const el = ref<HTMLElement | null>(null)

useFocusEntry({
  key: props.focusKey,
  el,
  onAction: () => emit('action', props.path),
})
</script>

<template>
  <a
    ref="el"
    :class="['nav-link', { active }]"
    :href="path"
    data-focusable
    tabindex="0"
    @click.prevent="emit('action', path)"
  >
    {{ label }}
  </a>
</template>

<style scoped>
.nav-link {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  outline: none;
  transition: background var(--motion-fast);
}
.nav-link.active {
  color: var(--color-text-primary);
  background: oklch(1 0 0 / 0.06);
}
.nav-link:focus-visible {
  background: oklch(1 0 0 / 0.12);
  color: var(--color-text-primary);
}
</style>
