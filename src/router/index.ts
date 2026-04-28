import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * Phase 1 router stub — only the splash routes exist. Phase 4 adds
 * AppShell + Home + lazy view registration; Phase 5+ fill out browse
 * surfaces; Phases 8-9 add /now-playing and /watch.
 *
 * Lazy `defineAsyncComponent`-style imports are used directly via dynamic
 * `import()` so unused chunks aren't paid for at boot.
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/splash/ReadyToCastScreen.vue'),
  },
  {
    path: '/sender-required',
    name: 'sender-required',
    component: () => import('@/views/splash/SenderRequiredScreen.vue'),
  },
  {
    // Phases 4-9 land their concrete views; for now park unknown intents
    // on the splash so dispatched intents don't crash the router.
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

export default router
