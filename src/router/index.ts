import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { authStore } from '@/stores/authStore';

/**
 * Two-tier routing per spec §10.6 (KeepAlive cache):
 *   - Splash routes (no shell) — render before auth lands
 *   - Shell routes — wrapped in AppShell with backdrop + topnav + KeepAlive
 *
 * Lazy chunks via dynamic import() — unused phases stay out of the initial
 * bundle. Phases 5-9 add concrete views inside AppShell's children.
 */

const routes: RouteRecordRaw[] = [
	{
		path: '/sender-required',
		name: 'sender-required',
		component: () => import('@/views/splash/SenderRequiredScreen.vue'),
	},
	{
		path: '/splash',
		name: 'splash',
		component: () => import('@/views/splash/ReadyToCastScreen.vue'),
	},
	{
		// Watch is fullscreen — sits outside AppShell so the topnav and
		// backdrop don't paint behind the video. Sender intent
		// play_video routes here directly.
		path: '/watch/:type/:id',
		name: 'watch',
		component: () => import('@/views/watch/WatchScreen.vue'),
	},
	{
		path: '/',
		component: () => import('@/layout/AppShell.vue'),
		children: [
			{
				path: '',
				name: 'home',
				component: () => import('@/views/home/HomeScreen.vue'),
			},
			{
				path: 'search',
				name: 'search',
				component: () => import('@/views/search/SearchScreen.vue'),
			},
			{
				path: 'libraries',
				name: 'libraries',
				component: () => import('@/views/libraries/LibrariesScreen.vue'),
			},
			{
				path: 'library/:pathMatch(.*)*',
				name: 'library',
				component: () => import('@/views/library/LibraryScreen.vue'),
			},
			{
				path: 'info/:type/:id',
				name: 'info',
				component: () => import('@/views/info/InfoScreen.vue'),
			},
			{
				path: 'person/:id',
				name: 'person',
				component: () => import('@/views/person/PersonScreen.vue'),
			},
			{
				path: 'music',
				name: 'music',
				component: () => import('@/views/music/MusicStartScreen.vue'),
			},
			{
				path: 'music/genres',
				name: 'music-genres',
				component: () => import('@/views/music/MusicGenresScreen.vue'),
			},
			{
				path: 'music/cards/:pathMatch(.*)*',
				name: 'music-cards',
				component: () => import('@/views/music/MusicCardsScreen.vue'),
			},
			{
				path: 'music/:type/:id',
				name: 'music-list',
				component: () => import('@/views/music/MusicListScreen.vue'),
			},
			{
				path: 'now-playing',
				name: 'now-playing',
				component: () => import('@/views/now-playing/NowPlayingScreen.vue'),
			},
			// Phase 9 lands /watch.
		],
	},
];

if (import.meta.env.DEV) {
	routes.push({
		path: '/__focus',
		name: 'dev-focus-playground',
		component: () => import('@/views/__test__/FocusPlayground.vue'),
	});
}

routes.push({
	path: '/:pathMatch(.*)*',
	redirect: '/',
});

export const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(_to, _from, savedPosition) {
		return savedPosition ?? { top: 0 };
	},
});

/**
 * Auth guard per spec §13 Phase 1 + Phase 4 — pre-auth, send to splash.
 * Receiver waits for LAUNCH customData before rendering protected routes.
 * Once customData is consumed, the navStore dispatches the initial intent
 * which routes to home/watch/now-playing as appropriate.
 */
router.beforeEach((to) => {
	if (to.name === 'sender-required' || to.name === 'splash')
		return true;
	if (import.meta.env.DEV && to.name === 'dev-focus-playground')
		return true;
	if (!authStore.ready.value) {
		return { name: 'splash', replace: true };
	}
	return true;
});

export default router;
