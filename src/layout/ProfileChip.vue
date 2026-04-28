<script setup lang="ts">
import { computed } from 'vue';
import { authStore } from '@/stores/authStore';

const displayName = computed(() => {
	const claims = authStore.userClaims.value;
	return (
		(claims?.display_name as string)
		?? (claims?.preferred_username as string)
		?? (claims?.given_name as string)
		?? 'You'
	);
});

const WHITESPACE = /\s+/;

const initials = computed(() => {
	return displayName.value
		.split(WHITESPACE)
		.map(s => s[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
});
</script>

<template>
	<div class="profile-chip">
		<span class="initials">{{ initials }}</span>
		<span class="name">{{ displayName }}</span>
	</div>
</template>

<style scoped>
.profile-chip {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 16px 6px 6px;
	background: oklch(1 0 0 / 0.08);
	border-radius: 999px;
}
.initials {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	display: grid;
	place-items: center;
	background: var(--color-accent);
	color: oklch(0.18 0.02 35);
	font-weight: 700;
	font-size: 14px;
}
.name {
	font-size: 14px;
	font-weight: 600;
	color: var(--color-text-primary);
}
</style>
