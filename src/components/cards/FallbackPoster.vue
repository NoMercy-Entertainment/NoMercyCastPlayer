<script setup lang="ts">
defineProps<{
	title?: string;
}>();
</script>

<template>
	<div class="fallback-poster">
		<span class="initials">{{ (title || '?').slice(0, 2).toUpperCase() }}</span>
	</div>
</template>

<style scoped>
.fallback-poster {
	width: 100%;
	height: 100%;
	display: grid;
	place-items: center;
	background: linear-gradient(135deg, oklch(0.25 0.04 285), oklch(0.18 0.02 250));
	color: var(--color-text-primary);
	font-weight: 700;
	font-size: 32px;
	border-radius: var(--radius-card);
}
</style>
