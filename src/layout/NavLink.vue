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
		<slot>{{ label }}</slot>
	</a>
</template>

<style scoped>
/*
 * Pill matches APK TvNavigationBar — rounded 20.dp inner, 24.dp outer with
 * a primary-tinted focus border. Selected state uses a horizontal gradient
 * to match Compose's primary→primary-80% brush.
 */
.nav-link {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 14px;
	border-radius: 20px;
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	text-decoration: none;
	outline: none;
	background: rgba(0, 0, 0, 0.6);
	border: 2px solid transparent;
	transition: background var(--motion-fast), border-color var(--motion-fast);
}
.nav-link.icon-only {
	padding: 6px 8px;
}
.nav-link.active {
	background: linear-gradient(
		90deg,
		var(--color-primary, oklch(0.7 0.2 285)),
		oklch(0.7 0.2 285 / 0.8)
	);
	box-shadow: 0 4px 16px oklch(0.7 0.2 285 / 0.4);
}
.nav-link:focus-visible {
	border-color: var(--color-primary, oklch(0.7 0.2 285));
	outline: none;
}
</style>
