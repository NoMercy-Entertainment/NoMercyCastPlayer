<script setup lang="ts">
/**
 * Phase 5 letter-picker stub. The android Leanback library view shows a
 * vertical letter-jump strip on the right edge of grids — useful for
 * 1000+ item libraries. v1 ships without it; library uses arrow-key
 * traversal only. v1.1 wires this composable when the existing query
 * hook supports server-side letter-jump endpoints.
 */
defineProps<{
	letters?: string[];
}>();
</script>

<template>
	<aside v-if="letters?.length" class="letter-picker">
		<ul>
			<li v-for="l in letters" :key="l">
				{{ l }}
			</li>
		</ul>
	</aside>
</template>

<style scoped>
.letter-picker {
	position: fixed;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	background: oklch(1 0 0 / 0.06);
	border-radius: 8px;
	padding: 8px;
	font-size: 12px;
	color: var(--color-text-secondary);
}
</style>
