<script setup lang="ts">
/*
 * Centered spinner. Mirrors APK LoadingIndicator.kt's CircularProgressIndicator.
 */
</script>

<template>
	<div class="loader" role="progressbar" aria-label="Loading">
		<div class="ring" />
	</div>
</template>

<style scoped>
.loader {
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	z-index: 1;
}
.ring {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	border: 3px solid rgba(255, 255, 255, 0.18);
	border-top-color: var(--color-primary, oklch(0.7 0.2 285));
	animation: spin 1s linear infinite;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
