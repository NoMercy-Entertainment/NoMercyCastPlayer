<script setup lang="ts">
const props = defineProps<{
  type: string
  id: string
}>()

if (import.meta.env.DEV) {
  console.warn(`[Resolver] Unknown component type "${props.type}" (id=${props.id})`)
}
</script>

<template>
  <!-- Production silently skips unknowns. Dev shows a debug card so the gap
       is visible. Add new component types as the server introduces them —
       never crash on unknowns. -->
  <div v-if="$attrs.dev || false" class="unknown-component">
    Unknown: {{ type }} ({{ id }})
  </div>
</template>

<style scoped>
.unknown-component {
  padding: 16px;
  border-radius: var(--radius-card);
  border: 2px dashed oklch(0.5 0.15 35);
  color: oklch(0.7 0.15 35);
  font-family: monospace;
}
</style>
