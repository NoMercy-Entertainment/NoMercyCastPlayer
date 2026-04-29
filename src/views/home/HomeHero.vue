<script setup lang="ts">
import { computed } from 'vue';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';

/*
 * Hero pinned to the top of the home view. Mirrors APK
 * components/VideoMusicHeroSection.kt's HeroRow — title (or logo when
 * present) + overview, no interactive buttons. The actual entry points
 * for Watch / Details live on the focused NMHomeCard or InfoScreen,
 * not on the hero itself. Hero is informational only.
 *
 * Backdrop layer is rendered separately by the parent screen so it can
 * persist through hero crossfades; here we only render the title +
 * overview text block aligned bottom-left.
 */

import type { FocusedCardData } from '@/stores/focusedCardStore';

const props = defineProps<{
	card: FocusedCardData;
}>();

const backdropUrl = computed(() =>
	buildImageUrl(props.card.backdrop ?? props.card.poster ?? null, BACKDROP_SIZE),
);

const logoUrl = computed(() => buildImageUrl(props.card.logo ?? null, { width: 600 }));

const transitionKey = computed(() => props.card.id ?? props.card.title ?? '');
</script>

<template>
	<section class="hero">
		<Transition name="hero-fade" mode="out-in">
			<div :key="transitionKey" class="art">
				<img
					v-if="backdropUrl"
					:src="backdropUrl"
					:alt="card.title ?? ''"
					loading="eager"
					decoding="async"
				>
				<div class="scrim" />
			</div>
		</Transition>

		<Transition name="hero-fade" mode="out-in">
			<div :key="transitionKey" class="content">
				<img
					v-if="logoUrl"
					class="logo"
					:src="logoUrl"
					:alt="card.title ?? ''"
				>
				<h1 v-else class="title">
					{{ card.title }}
				</h1>
				<p v-if="card.overview" class="overview">
					{{ card.overview }}
				</p>
			</div>
		</Transition>
	</section>
</template>

<style scoped>
.hero {
	position: relative;
	width: 100%;
	height: 60vh;
	min-height: 320px;
	max-height: 432px;
	overflow: hidden;
	background: oklch(0.12 0.01 250);
}
.art {
	position: absolute;
	inset: 0;
}
.art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.scrim {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 45%, transparent 75%),
		linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, transparent 65%);
}
.content {
	position: absolute;
	inset: auto 0 0 0;
	width: 60%;
	padding: 24px 36px 56px;
	color: #fff;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.logo {
	max-width: 360px;
	max-height: 132px;
	object-fit: contain;
	object-position: left center;
	filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
}
.title {
	margin: 0;
	font-size: 36px;
	font-weight: 700;
	line-height: 1.05;
	letter-spacing: -0.01em;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.overview {
	margin: 0;
	font-size: 15px;
	line-height: 1.45;
	color: oklch(0.95 0.005 250);
	display: -webkit-box;
	-webkit-line-clamp: 7;
	-webkit-box-orient: vertical;
	overflow: hidden;
	max-width: 600px;
}

.hero-fade-enter-active,
.hero-fade-leave-active {
	transition: opacity 360ms ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
	opacity: 0;
}
</style>
