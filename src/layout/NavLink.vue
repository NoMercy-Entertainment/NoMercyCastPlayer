<script setup lang="ts">
import { ref } from 'vue';
import { useFocusEntry } from '@/composables/useFocusEntry';

/*
 * Pill matches APK TvNavigationBarButton.
 *   - Inactive: black 0.6 alpha bg, 20dp inner radius
 *   - Active: primary→primary 0.85 horizontal gradient with shadow
 *   - Outer focus border ring at 24dp radius (palette-tinted)
 *   - Icon (20dp white tint) + label (13sp white) — text colour stays
 *     white in both states, the gradient + shadow are the active marker
 */

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
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	text-decoration: none;
	outline: none;
	background: oklch(0 0 0 / 0.6);
	border: 2px solid transparent;
	transition:
		background var(--motion-fast),
		border-color var(--motion-fast),
		transform var(--motion-fast),
		box-shadow var(--motion-fast);
}
.nav-link.icon-only {
	width: 40px;
	padding: 0;
	justify-content: center;
}
.nav-link.active {
	background: linear-gradient(90deg, var(--color-primary, oklch(0.7 0.2 285)), oklch(0.7 0.2 285 / 0.85));
	box-shadow: 0 6px 16px oklch(0.7 0.2 285 / 0.35);
}
.nav-link:focus-visible {
	border-color: var(--color-primary, oklch(0.7 0.2 285));
	transform: translateY(-1px);
	outline: none;
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
