<script setup lang="ts">
import { ref } from 'vue'
import { useFocusGroup } from '@/composables/useFocusGroup'
import SearchKey from './SearchKey.vue'

const emit = defineEmits<{
  type: [letter: string]
  backspace: []
  clear: []
  done: []
  space: []
}>()

const containerEl = ref<HTMLElement | null>(null)
useFocusGroup({
  type: 'grid',
  restorationKey: 'search-keyboard',
  initialFocusKey: 'kb-A',
  columns: 9,
  containerEl,
})

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const numbers = '0123456789'.split('')

function handlePress(letter: string): void {
  emit('type', letter.toLowerCase())
}
</script>

<template>
  <div ref="containerEl" class="kb">
    <div class="row">
      <SearchKey
        v-for="l in letters.slice(0, 9)"
        :key="l"
        :focus-key="`kb-${l}`"
        :label="l"
        @press="handlePress(l)"
      />
    </div>
    <div class="row">
      <SearchKey
        v-for="l in letters.slice(9, 18)"
        :key="l"
        :focus-key="`kb-${l}`"
        :label="l"
        @press="handlePress(l)"
      />
    </div>
    <div class="row">
      <SearchKey
        v-for="l in letters.slice(18, 26)"
        :key="l"
        :focus-key="`kb-${l}`"
        :label="l"
        @press="handlePress(l)"
      />
    </div>
    <div class="row">
      <SearchKey
        v-for="n in numbers"
        :key="n"
        :focus-key="`kb-${n}`"
        :label="n"
        variant="number"
        @press="handlePress(n)"
      />
    </div>
    <div class="row hot-row">
      <SearchKey
        focus-key="kb-space"
        label="Space"
        variant="hot"
        wide
        @press="emit('space')"
      />
      <SearchKey
        focus-key="kb-back"
        label="⌫ Backspace"
        variant="hot"
        wide
        @press="emit('backspace')"
      />
      <SearchKey
        focus-key="kb-clear"
        label="Clear"
        variant="hot"
        wide
        @press="emit('clear')"
      />
      <SearchKey
        focus-key="kb-done"
        label="Done"
        variant="hot"
        wide
        @press="emit('done')"
      />
    </div>
  </div>
</template>

<style scoped>
.kb {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: oklch(0.14 0.01 250);
  border-radius: 16px;
}
.row {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
}
.hot-row {
  grid-template-columns: repeat(4, 1fr);
}
</style>
