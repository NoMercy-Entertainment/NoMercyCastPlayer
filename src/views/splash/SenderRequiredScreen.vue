<script setup lang="ts">
/**
 * DEGRADED-state splash per spec §3.2 + §8.5.
 * Refresh failure → "Re-cast from your phone to continue."
 * Receiver doesn't auto-end the session; cast_shell decides when to unload.
 */
</script>

<template>
  <main class="degraded">
    <div class="card">
      <div class="icon" aria-hidden="true">↻</div>
      <h1>Re-cast from your phone</h1>
      <p>
        Your cast session expired. Open NoMercy on your phone or desktop and
        cast to this device to continue.
      </p>
    </div>
  </main>
</template>

<style scoped>
.degraded {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--color-bg-base);
}
.card {
  text-align: center;
  padding: 64px;
  max-width: 720px;
}
.icon {
  font-size: 80px;
  color: var(--color-accent);
  margin-bottom: 16px;
}
h1 {
  font-size: 40px;
  font-weight: 700;
  margin: 0 0 16px;
}
p {
  font-size: 20px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}
</style>
