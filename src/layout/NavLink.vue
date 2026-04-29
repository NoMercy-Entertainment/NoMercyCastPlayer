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
	padding: 10px 22px;
	height: 44px;
	border-radius: 999px;
	font-size: 14px;
	font-weight: 600;
	color: #fff;
	text-decoration: none;
	outline: none;
	background: rgba(0, 0, 0, 0.6);
	border: 2px solid transparent;
	transition:
		background var(--motion-fast),
		border-color var(--motion-fast),
		transform var(--motion-fast);
}
.nav-link.icon-only {
	width: 44px;
	padding: 0;
	justify-content: center;
}
.nav-link.active {
	background: linear-gradient(90deg, var(--color-primary, oklch(0.7 0.2 285)), oklch(0.7 0.2 285 / 0.85));
	box-shadow: 0 4px 16px oklch(0.7 0.2 285 / 0.4);
	color: oklch(0.18 0.02 35);
}
.nav-link:focus-visible {
	border-color: oklch(1 0 0 / 0.85);
	transform: translateY(-1px);
	outline: none;
}
</style>
