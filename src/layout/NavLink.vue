<script setup lang="ts">
import { ref } from 'vue';
import { useFocusEntry } from '@/composables/useFocusEntry';

const props = defineProps<{
	focusKey: string;
	label: string;
	path: string;
	active: boolean;
	iconOnly?: boolean;
	ariaLabel?: string;
}>();

const emit = defineEmits<{ action: [path: string] }>();

const el = ref<HTMLElement | null>(null);

useFocusEntry({
	key: props.focusKey,
	el,
	onAction: () => emit('action', props.path),
});
</script>

<template>
	<a
		ref="el"
		class="nav-link"
		:class="[{ active, 'icon-only': iconOnly }]"
		:href="path"
		:aria-label="ariaLabel ?? label"
		data-focusable
		tabindex="0"
		@click.prevent="emit('action', path)"
	>
		<span v-if="$slots.icon" class="icon">
			<slot name="icon" />
		</span>
		<span v-if="!iconOnly && label" class="label">{{ label }}</span>
		<slot />
	</a>
</template>

<style scoped>
.nav-link {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 0 14px 0 12px;
	height: 40px;
	border-radius: 20px;
	font-size: 18px;
	font-weight: 400;
	color: #fff;
	text-decoration: none;
	background: oklch(0 0 0 / 0.6);
	transition:
		background var(--motion-fast),
		box-shadow var(--motion-fast);
	outline: 2px solid transparent;
	outline-offset: 6px;
	border-radius: 20px;
}
.nav-link.icon-only {
	width: 40px;
	padding: 0;
	justify-content: center;
}
.nav-link.active {
	background: var(--color-primary, oklch(0.7 0.2 285));
	box-shadow: 0 6px 16px hsl(from var(--color-primary, oklch(0.7 0.2 285)) h s l / 0.35);
}
.nav-link:focus-visible {
	outline-color: var(--color-primary, oklch(0.7 0.2 285));
}
.icon {
	display: inline-grid;
	place-items: center;
	width: 20px;
	height: 20px;
	color: #fff;
}
.label {
	letter-spacing: 0.01em;
}
</style>
