<script setup lang="ts">
import { computed } from 'vue';
import { authStore } from '@/stores/authStore';

/*
 * Read-only server info — mirrors APK ServerInfoScreen.kt. Cast receiver
 * doesn't currently expose the connected server's metadata (name,
 * description, version) in the auth payload — we render the IDs we have
 * and a hint to switch via the sender.
 */

const serverId = computed(() => authStore.serverId.value ?? 'Unknown');
const serverUrl = computed(() => authStore.serverUrl.value ?? 'Unknown');
const deviceId = computed(() => authStore.deviceId.value ?? 'Unknown');
const sessionId = computed(() => authStore.castSessionId.value ?? 'Unknown');
</script>

<template>
	<div class="server-info-screen">
		<header class="page-header">
			<h1>Server info</h1>
		</header>

		<div class="card">
			<dl class="kv">
				<dt>Server ID</dt>
				<dd>
					{{ serverId }}
				</dd>
				<dt>Server URL</dt>
				<dd class="mono">
					{{ serverUrl }}
				</dd>
				<dt>Device ID</dt>
				<dd class="mono">
					{{ deviceId }}
				</dd>
				<dt>Cast session</dt>
				<dd class="mono">
					{{ sessionId }}
				</dd>
			</dl>
		</div>

		<p class="hint">
			Switch servers from the NoMercy app on your phone or browser.
		</p>
	</div>
</template>

<style scoped>
.server-info-screen {
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none;
	padding: 32px;
}
.server-info-screen::-webkit-scrollbar {
	display: none;
}
.page-header {
	max-width: 920px;
	margin: 0 auto 16px;
}
.page-header h1 {
	margin: 0;
	font-size: 24px;
	font-weight: 700;
}
.card {
	max-width: 920px;
	margin: 0 auto 24px;
	padding: 24px;
	background: oklch(0.18 0.01 250 / 0.85);
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 16px;
	color: #fff;
}
.kv {
	margin: 0;
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 12px 24px;
}
.kv dt {
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: oklch(0.7 0.005 250);
}
.kv dd {
	margin: 0;
	font-size: 14px;
	color: oklch(0.95 0.005 250);
	word-break: break-all;
}
.mono {
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	font-size: 12px;
}
.hint {
	max-width: 920px;
	margin: 0 auto;
	font-size: 13px;
	color: oklch(0.7 0.005 250);
}
</style>
