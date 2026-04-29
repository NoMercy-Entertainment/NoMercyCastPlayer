<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { authStore } from '@/stores/authStore';
import { socketStore } from '@/stores/socketStore';
import logoWide from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

// TEMP debug — surfaces body[data-launch-diag] from attachLaunchListener so
// we can verify customData arrival on TVs without remote DevTools. Remove
// once the Phase 0 → AUTHED flow is reliable.
const launchDiag = ref<string>('(waiting)');
const showDiag = ref<boolean>(true);
onMounted(() => {
	const tick = (): void => {
		launchDiag.value = document.body.dataset.launchDiag ?? '(no diag yet)';
	};
	tick();
	const id = window.setInterval(tick, 500);
	window.setTimeout(() => {
		window.clearInterval(id);
		showDiag.value = false;
	}, 30_000);
});

/**
 * Splash screen styled to match the original cast-player aesthetic so
 * the receiver shares visual language with sender apps. Wired to
 * authStore + socketStore reactive state — no debug console (TV
 * burn-in risk; dev playground at /__focus is the diagnostic surface
 * during development).
 */

const status = computed(() => {
	switch (authStore.receiverState.value) {
		case 'LOADING':
			return 'Connecting…';
		case 'AUTHED':
			return 'Connecting to your server…';
		case 'CONNECTING':
			return 'Connecting to your server…';
		case 'READY':
			return 'Ready to cast';
		case 'TEARDOWN':
			return 'Closing';
		default:
			return 'Ready to cast';
	}
});

const userName = computed(() => {
	const claims = authStore.userClaims.value;
	if (!claims)
		return '';
	return (claims.display_name as string) ?? (claims.preferred_username as string) ?? '';
});

const isConnected = computed(() => socketStore.connectionState.value === 'connected');
const isPulsing = computed(() => !isConnected.value);
</script>

<template>
	<main class="splash">
		<img class="bg" :src="splash" alt="" aria-hidden="true">

		<section class="content">
			<div class="status-row">
				<h1 class="status-text" :class="[{ pulse: isPulsing }]">
					{{ status }}
				</h1>
				<div
					v-if="isConnected"
					class="dot"
					title="Connected"
				/>
			</div>

			<p class="instructions">
				<template v-if="userName">
					<span>Hi <strong>{{ userName }}</strong>, to start casting tap the</span>
					<br>
					<span class="emphasis">Chromecast</span>
					<span> button in the NoMercy app.</span>
				</template>
				<template v-else>
					<span>To start casting audio or video tap the</span>
					<br>
					<span class="emphasis">Chromecast</span>
					<span> button in the MediaPlayer or App.</span>
				</template>
			</p>
		</section>

		<img class="phone" :src="mobile" alt="" aria-hidden="true">

		<img class="brand" :src="logoWide" alt="NoMercy">

		<pre v-if="showDiag" class="diag">{{ launchDiag }}</pre>
	</main>
</template>

<style scoped>
.splash {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	overflow: hidden;
	background: linear-gradient(180deg, #232323, #161616);
	padding: 45px 100px;
}

.bg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: auto;
	aspect-ratio: 16 / 9;
	object-fit: cover;
	pointer-events: none;
}

.content {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 625px;
	z-index: 1;
}

.status-row {
	display: flex;
	align-items: center;
	gap: 16px;
}

.status-text {
	margin: 0;
	font-size: 40px;
	font-weight: 900;
	color: #ededed;
	line-height: 1;
}

.status-text.pulse {
	animation: pulse 2s ease-in-out infinite;
}

.dot {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: oklch(0.7 0.15 145);
	animation: pulse 2s ease-in-out infinite;
}

.instructions {
	margin: 0;
	font-size: 20px;
	color: #ededed;
	line-height: 1.4;
}

.emphasis {
	font-weight: 700;
}

.phone {
	position: relative;
	width: 240px;
	height: 268px;
	z-index: 1;
}

.brand {
	position: relative;
	height: 48px;
	width: max-content;
	z-index: 1;
}

.diag {
	position: absolute;
	right: 12px;
	bottom: 12px;
	max-width: 50%;
	padding: 8px 12px;
	font: 14px/1.3 monospace;
	color: #ffe2a8;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid #555;
	border-radius: 6px;
	white-space: pre-wrap;
	z-index: 2;
}

@keyframes pulse {
	0%,
	100% {
		opacity: 0.7;
	}

	50% {
		opacity: 1;
	}
}
</style>
