<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/authStore'
import { useDPad } from '@/composables/useDPad'
import SenderRequiredScreen from '@/views/splash/SenderRequiredScreen.vue'

/**
 * Root layout. Phase 1 only renders splash routes via <RouterView>;
 * Phase 4 introduces AppShell with backdrop + topnav + KeepAlive cache.
 *
 * useDPad is mounted here so the global keydown handler is alive for the
 * entire receiver session. The handler dispatches to the top-of-stack
 * FocusGroup; groups register/unregister themselves via the focusStore
 * stack as routes mount.
 *
 * DEGRADED state preempts whatever route is active — refresh failure
 * means we cannot reach server APIs, so the only useful screen is the
 * sender-required splash.
 */

const router = useRouter()
useDPad(router)

const inDegraded = computed(() => authStore.receiverState.value === 'DEGRADED')

onMounted(() => {
  document.addEventListener('visibilitychange', () => {
    console.debug('[app] visibilitychange', document.visibilityState)
  })
})
</script>

<template>
  <SenderRequiredScreen v-if="inDegraded" />
  <RouterView v-else />
</template>
