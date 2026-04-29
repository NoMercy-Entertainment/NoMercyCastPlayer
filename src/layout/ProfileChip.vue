<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { authStore } from '@/stores/authStore';

/*
 * Profile avatar in the trailing slot of the topnav. Mirrors APK
 * TvNavigationBar.kt's ProfileImage:
 *   - Circular 36px avatar (gravatar fallback / initials)
 *   - Focusable via D-pad, palette-tinted ring on focus
 *   - Center-click navigates to /profile
 */

const router = useRouter();

const displayName = computed(() => {
	const claims = authStore.userClaims.value;
	return (
		(claims?.display_name as string)
		?? (claims?.preferred_username as string)
		?? (claims?.given_name as string)
		?? 'You'
	);
});

const userEmail = computed(() => authStore.userClaims.value?.email as string | undefined);

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

const avatarUrl = computed(() => {
	const email = userEmail.value;
	if (!email)
		return null;
	let h = 0;
	for (let i = 0; i < email.length; i++)
		h = ((h << 5) - h + email.charCodeAt(i)) | 0;
	return `https://www.gravatar.com/avatar/${(h >>> 0).toString(16)}?d=retro&s=80`;
});

const el = ref<HTMLElement | null>(null);
useFocusEntry({
	key: 'nav-profile',
	el,
	onAction: () => {
		router.push('/profile');
	},
});
</script>

<template>
	<button
		ref="el"
		class="profile-chip"
		type="button"
		data-focusable
		tabindex="0"
		:aria-label="`Profile: ${displayName}`"
		@click.prevent="router.push('/profile')"
	>
		<img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="avatar">
		<span v-else class="initials">{{ initials }}</span>
	</button>
</template>

<style scoped>
.profile-chip {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: oklch(0 0 0 / 0.6);
	border: 2px solid transparent;
	padding: 0;
	cursor: pointer;
	overflow: hidden;
	outline: none;
	transition:
		border-color var(--motion-fast),
		transform var(--motion-fast);
	display: grid;
	place-items: center;
}
.profile-chip:focus-visible {
	border-color: var(--color-primary, oklch(0.7 0.2 285));
	transform: translateY(-1px);
}
.avatar {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}
.initials {
	display: grid;
	place-items: center;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
	color: #fff;
	font-weight: 700;
	font-size: 14px;
	letter-spacing: 0.04em;
}
</style>
