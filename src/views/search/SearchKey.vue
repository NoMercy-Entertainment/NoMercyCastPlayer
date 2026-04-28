<script setup lang="ts">
import { ref } from 'vue';
import { useFocusEntry } from '@/composables/useFocusEntry';

const props = defineProps<{
	focusKey: string;
	label: string;
	variant?: 'letter' | 'number' | 'hot';
	wide?: boolean;
}>();

const emit = defineEmits<{ press: [key: string] }>();

const el = ref<HTMLElement | null>(null);

useFocusEntry({
	key: props.focusKey,
	el,
	onAction: () => emit('press', props.label),
});
</script>

<template>
	<button
		ref="el"
		type="button"
		class="key" :class="[`key-${variant ?? 'letter'}`, { wide }]"
		data-focusable
		tabindex="0"
	>
		{{ label }}
	</button>
</template>

<style scoped>
.key {
	font: inherit;
	border: 0;
	cursor: pointer;
	background: oklch(0.22 0.01 250);
	color: var(--color-text-primary);
	font-weight: 600;
	border-radius: 12px;
	padding: 16px 0;
	min-width: 56px;
	outline: none;
	transition: background var(--motion-fast);
}
.key.wide {
	min-width: 120px;
	padding-inline: 16px;
}
.key-hot {
	background: oklch(0.28 0.05 285);
}
.key-number {
	background: oklch(0.18 0.02 250);
}
.key:focus-visible {
	background: var(--color-accent);
	color: oklch(0.18 0.02 35);
}
</style>
