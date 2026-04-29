<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { useMeQuery } from '@/queries/useMeQuery';
import { authStore } from '@/stores/authStore';

/*
 * Profile / settings hub. Mirrors APK ProfileScreen.kt — vertical stack
 * of focusable cards: ProfileHeaderCard (avatar + name + email, click =
 * sign out with confirm), ServerCard (current server), ProfileMenuRow
 * for Settings, About, optional Environment switch.
 */

const router = useRouter();

const containerEl = ref<HTMLElement | null>(null);
const profileGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'profile-list',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge(profileGroup);

const { data: me } = useMeQuery();

const claims = computed(() => authStore.userClaims.value ?? null);
const userName = computed(
	() =>
		me.value?.name
		?? (claims.value?.display_name as string)
		?? (claims.value?.preferred_username as string)
		?? 'User',
);
const userEmail = computed(
	() => me.value?.email ?? (claims.value?.email as string | undefined) ?? '',
);
const avatarUrl = computed(() => {
	if (me.value?.avatarUrl)
		return me.value.avatarUrl;
	const email = userEmail.value;
	if (!email)
		return null;
	// Gravatar fallback identical to APK's avatar resolution path.
	let h = 0;
	for (let i = 0; i < email.length; i++)
		h = ((h << 5) - h + email.charCodeAt(i)) | 0;
	return `https://www.gravatar.com/avatar/${(h >>> 0).toString(16)}?d=retro&s=120`;
});

const headerEl = ref<HTMLElement | null>(null);
const serverEl = ref<HTMLElement | null>(null);
const settingsEl = ref<HTMLElement | null>(null);
const aboutEl = ref<HTMLElement | null>(null);

const showSignOutConfirm = ref(false);
const dialogCancelEl = ref<HTMLButtonElement | null>(null);
const dialogConfirmEl = ref<HTMLButtonElement | null>(null);

function handleDialogKey(e: KeyboardEvent): void {
	if (e.key === 'Escape' || e.key === 'Back' || e.key === 'GoBack') {
		e.preventDefault();
		showSignOutConfirm.value = false;
		return;
	}
	if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
		e.preventDefault();
		const focused = document.activeElement;
		if (focused === dialogCancelEl.value)
			dialogConfirmEl.value?.focus();
		else
			dialogCancelEl.value?.focus();
	}
}

watch(showSignOutConfirm, async (open) => {
	if (open) {
		await nextTick();
		dialogCancelEl.value?.focus();
		window.addEventListener('keydown', handleDialogKey, true);
	}
	else {
		window.removeEventListener('keydown', handleDialogKey, true);
	}
});

useFocusEntry({
	key: 'profile-header',
	el: headerEl,
	onAction: () => {
		showSignOutConfirm.value = true;
	},
});

useFocusEntry({
	key: 'profile-server',
	el: serverEl,
	onAction: () => {
		router.push('/profile/server-info');
	},
});

useFocusEntry({
	key: 'profile-settings',
	el: settingsEl,
	onAction: () => {
		router.push('/profile/settings');
	},
});

useFocusEntry({
	key: 'profile-about',
	el: aboutEl,
	onAction: () => {
		router.push('/profile/about');
	},
});

function confirmSignOut(): void {
	showSignOutConfirm.value = false;
	authStore.clear();
	router.push('/splash');
}
</script>

<template>
	<div class="profile-screen nm-page-screen">
		<div ref="containerEl" class="list">
			<button
				ref="headerEl"
				class="card header-card"
				data-focusable
				tabindex="0"
				@click.prevent="showSignOutConfirm = true"
			>
				<img
					v-if="avatarUrl"
					class="avatar"
					:src="avatarUrl"
					alt=""
				>
				<div v-else class="avatar avatar-fallback">
					{{ userName.slice(0, 1).toUpperCase() }}
				</div>
				<div class="header-meta">
					<p class="name">
						{{ userName }}
					</p>
					<p v-if="userEmail" class="email">
						{{ userEmail }}
					</p>
				</div>
				<span class="hint">Sign out</span>
			</button>

			<button
				ref="serverEl"
				class="card row-card"
				data-focusable
				tabindex="0"
				@click.prevent="router.push('/profile/server-info')"
			>
				<div class="row-meta">
					<p class="row-label">
						Current server
					</p>
					<p class="row-primary">
						{{ authStore.serverId.value ?? 'Unknown' }}
					</p>
				</div>
				<span class="row-action">Switch</span>
			</button>

			<button
				ref="settingsEl"
				class="card row-card"
				data-focusable
				tabindex="0"
				@click.prevent="router.push('/profile/settings')"
			>
				<p class="row-primary">
					Settings
				</p>
			</button>

			<button
				ref="aboutEl"
				class="card row-card"
				data-focusable
				tabindex="0"
				@click.prevent="router.push('/profile/about')"
			>
				<p class="row-primary">
					About
				</p>
			</button>
		</div>

		<div
			v-if="showSignOutConfirm"
			class="nm-dialog-backdrop"
			role="dialog"
			aria-modal="true"
			aria-labelledby="signout-dialog-title"
		>
			<div class="nm-dialog">
				<h2 id="signout-dialog-title" class="nm-dialog-title">
					Sign out
				</h2>
				<p class="nm-dialog-message">
					Sign out of {{ userName }}?
				</p>
				<div class="nm-dialog-actions">
					<button
						ref="dialogCancelEl"
						type="button"
						class="btn btn-secondary"
						@click="showSignOutConfirm = false"
					>
						Cancel
					</button>
					<button
						ref="dialogConfirmEl"
						type="button"
						class="btn btn-primary"
						@click="confirmSignOut"
					>
						Sign out
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-width: 920px;
	margin: 0 auto;
}
.card {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background: oklch(0.18 0.01 250 / 0.85);
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 14px;
	color: #fff;
	font-family: inherit;
	cursor: pointer;
	outline: none;
	transition:
		border-color var(--motion-fast),
		transform var(--motion-fast);
}
.card:focus-visible {
	border-color: rgba(255, 255, 255, 0.85);
	border-width: 3px;
	transform: translateY(-1px);
}
.header-card {
	gap: 12px;
}
.avatar {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	object-fit: cover;
	flex: 0 0 auto;
}
.avatar-fallback {
	display: grid;
	place-items: center;
	background: linear-gradient(135deg, oklch(0.7 0.2 285), oklch(0.7 0.2 35));
	color: #fff;
	font-weight: 700;
	font-size: 20px;
}
.header-meta {
	flex: 1;
	text-align: left;
}
.name {
	margin: 0;
	font-size: 18px;
	font-weight: 700;
}
.email {
	margin: 4px 0 0;
	font-size: 13px;
	color: oklch(0.85 0.005 250);
}
.hint {
	font-size: 13px;
	font-weight: 600;
	color: oklch(0.85 0.005 250);
	opacity: 0;
	transition: opacity var(--motion-fast);
}
.header-card:focus-visible .hint {
	opacity: 1;
	color: var(--color-primary, oklch(0.7 0.2 285));
}
.row-card {
	gap: 12px;
}
.row-meta {
	flex: 1;
	text-align: left;
}
.row-label {
	margin: 0;
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: oklch(0.7 0.005 250);
}
.row-primary {
	margin: 4px 0 0;
	font-size: 16px;
	font-weight: 600;
}
.row-action {
	font-size: 12px;
	font-weight: 600;
	color: oklch(0.85 0.005 250);
	background: rgba(255, 255, 255, 0.1);
	padding: 6px 10px;
	border-radius: 8px;
}
.btn {
	padding: 10px 16px;
	border-radius: 999px;
	font-size: 13px;
	font-weight: 600;
	border: 2px solid transparent;
	cursor: pointer;
	outline: none;
	transition:
		transform var(--motion-fast),
		border-color var(--motion-fast);
}
.btn:focus-visible {
	transform: scale(1.04);
	border-color: rgba(255, 255, 255, 0.95);
}
.btn-primary {
	background: var(--color-primary, oklch(0.7 0.2 285));
	color: #fff;
}
.btn-secondary {
	background: rgba(255, 255, 255, 0.1);
	color: #fff;
}
</style>
