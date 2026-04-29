<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFocusGroup } from '@/composables/useFocusGroup';
import NowPlayingPill from './NowPlayingPill.vue';
import ProfileChip from './ProfileChip.vue';
import NavLink from './NavLink.vue';
import { socketStore } from '@/stores/socketStore';

/*
 * Topnav matches APK TvNavigationBar layout:
 *   [music indicator | brand]   [Home | Libraries | Music | (search-icon)]   [profile circle]
 *      weight 1                          weight 3 (centered)                       weight 1
 *
 * Search is the magnifier icon at the trailing edge of the nav row, not a
 * pill with text — APK keeps it visually subordinate to the primary three.
 */
interface NavItem {
	key: string;
	label: string;
	path: string;
}

const items: NavItem[] = [
	{ key: 'nav-home', label: 'Home', path: '/' },
	{ key: 'nav-libraries', label: 'Libraries', path: '/libraries' },
	{ key: 'nav-music', label: 'Music', path: '/music' },
];

const navEl = ref<HTMLElement | null>(null);
const router = useRouter();
const route = useRoute();

// Show the now-playing pill on the leading slot only when music is actually
// playing (placeholder — wire to a music store flag in a follow-up).
// eslint-disable-next-line ts/no-unused-vars
const isMusicPlaying = computed(() => false && socketStore.connectionState.value === 'connected');

useFocusGroup({
	type: 'horizontal',
	restorationKey: 'topnav',
	containerEl: navEl,
});
</script>

<template>
	<header class="topnav">
		<div class="leading">
			<NowPlayingPill v-if="isMusicPlaying" />
			<div v-else class="brand">
				<span class="logo-mark">NM</span>
			</div>
		</div>
		<nav ref="navEl" class="nav-items">
			<NavLink
				v-for="item in items"
				:key="item.key"
				:focus-key="item.key"
				:label="item.label"
				:path="item.path"
				:active="route.path === item.path"
				@action="(p) => router.push(p)"
			/>
			<NavLink
				focus-key="nav-search"
				label=""
				path="/search"
				:icon-only="true"
				aria-label="Search"
				:active="route.path === '/search'"
				@action="(p) => router.push(p)"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="7" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			</NavLink>
		</nav>
		<div class="trailing">
			<ProfileChip />
		</div>
	</header>
</template>

<style scoped>
.topnav {
	position: relative;
	z-index: 2;
	display: grid;
	grid-template-columns: 1fr 3fr 1fr;
	align-items: center;
	padding: 16px 36px;
	height: var(--topnav-height);
}
.leading {
	display: flex;
	align-items: center;
	justify-content: flex-start;
}
.brand {
	font-weight: 800;
	font-size: 24px;
}
.logo-mark {
	background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}
.nav-items {
	display: flex;
	justify-content: center;
	gap: 16px;
}
.trailing {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}
</style>
