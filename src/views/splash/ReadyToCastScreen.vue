<script setup lang="ts">
import { computed } from 'vue'
import { authStore } from '@/stores/authStore'

const stateLabel = computed(() => {
  switch (authStore.receiverState.value) {
    case 'LOADING':
      return 'Connecting…'
    case 'AUTHED':
      return 'Authenticated'
    case 'CONNECTING':
      return 'Connecting to your server…'
    case 'READY':
      return 'Ready'
    case 'DEGRADED':
      return 'Degraded'
    case 'TEARDOWN':
      return 'Closing'
    default:
      return ''
  }
})

const userLabel = computed(() => {
  const claims = authStore.userClaims.value
  if (!claims) return ''
  return (claims.display_name as string) ?? (claims.preferred_username as string) ?? (claims.sub as string) ?? ''
})

const expiryLabel = computed(() => {
  const exp = authStore.expiresAtMs.value
  if (!exp) return ''
  const minutes = Math.max(0, Math.round((exp - Date.now()) / 60_000))
  return `Token valid for ${minutes} min`
})
</script>

<template>
  <main class="splash">
    <div class="splash-card">
      <div class="logo-mark" aria-hidden="true">NM</div>
      <h1 class="brand">NoMercy</h1>
      <p class="subline">Cast Receiver</p>

      <div v-if="authStore.ready.value" class="status">
        <p class="state-label">{{ stateLabel }}</p>
        <p v-if="userLabel" class="user-label">Signed in as <strong>{{ userLabel }}</strong></p>
        <p v-if="expiryLabel" class="expiry-label">{{ expiryLabel }}</p>
      </div>

      <div v-else class="status">
        <p class="state-label">{{ stateLabel }}</p>
        <p class="hint">Cast from your phone or desktop to start.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.splash {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 30%, oklch(0.22 0.04 285 / 0.6), transparent 60%),
    radial-gradient(circle at 70% 70%, oklch(0.22 0.06 35 / 0.5), transparent 60%),
    var(--color-bg-base);
}
.splash-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px;
  border-radius: 32px;
  background: oklch(0.16 0.01 250 / 0.6);
  backdrop-filter: blur(24px);
}
.logo-mark {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -2px;
  background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.brand {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
}
.subline {
  font-size: 20px;
  color: var(--color-text-secondary);
  margin: 0;
}
.status {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.state-label {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-accent);
  margin: 0;
}
.user-label,
.expiry-label,
.hint {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}
.user-label strong {
  color: var(--color-text-primary);
}
</style>
