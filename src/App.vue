<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { authStore } from '@/stores/authStore'
import SenderRequiredScreen from '@/views/splash/SenderRequiredScreen.vue'

/**
 * Root layout. Phase 1 only renders splash routes via <RouterView>;
 * Phase 4 introduces AppShell with backdrop + topnav + KeepAlive cache.
 *
 * DEGRADED state preempts whatever route is active — refresh failure
 * means we cannot reach server APIs, so the only useful screen is the
 * sender-required splash.
 */

const inDegraded = computed(() => authStore.receiverState.value === 'DEGRADED')

onMounted(() => {
  // Visibility hooks for cast_shell suspend/resume — full handling lands in
  // Phase 10. Phase 1 just makes sure the receiver process logs lifecycle
  // transitions so we can debug from chrome://inspect during early QC.
  document.addEventListener('visibilitychange', () => {
    console.debug('[app] visibilitychange', document.visibilityState)
  })
})
</script>

<template>
  <SenderRequiredScreen v-if="inDegraded" />
  <RouterView v-else />
</template>
