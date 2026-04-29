<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
	ariaLabel?: string;
}>();

const trackEl = ref<HTMLElement | null>(null);
defineExpose({ trackEl });
</script>

<template>
	<div
		ref="trackEl"
		class="rail-track nm-no-scrollbar"
		:aria-label="ariaLabel"
		role="list"
	>
		<slot />
	</div>
</template>

<style scoped>
.rail-track {
	display: flex;
	gap: var(--rail-card-gap);
	overflow-x: auto;
	overflow-y: visible;
	/* APK contentPadding(start = 40dp). End padding scales with peek so
		the last card never glues to the right edge. */
	padding: 16px var(--tv-safe-padding) 16px 40px;
	scroll-behavior: smooth;
}
</style>
