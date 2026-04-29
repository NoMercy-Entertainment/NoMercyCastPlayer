<script setup lang="ts">
import { computed } from 'vue';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';
import SplitTitleText from '@/components/text/SplitTitleText.vue';

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
				<SplitTitleText
					v-else
					:title="card.title"
					main-class="hero-main"
					subtitle-class="hero-sub"
				/>
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
	/* APK heroHeight is 336dp — at 720p that's 47vh. Capped so it
		never eats the rails on smaller screens. */
	height: 47vh;
	min-height: 280px;
	max-height: 380px;
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
	inset: 0;
	width: 60%;
	padding: 32px var(--tv-safe-padding) 56px var(--tv-safe-padding);
	color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 12px;
}
.logo {
	max-width: 360px;
	max-height: 132px;
	object-fit: contain;
	object-position: left center;
	filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
}
:deep(.hero-main) {
	font-size: 36px;
	font-weight: 700;
	line-height: 1.05;
	letter-spacing: -0.01em;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
:deep(.hero-sub) {
	font-size: 22px;
	font-weight: 500;
	line-height: 1.15;
	color: oklch(0.92 0.005 250);
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}
.overview {
	margin: 0;
	font-size: 15px;
	line-height: 1.45;
	color: oklch(0.95 0.005 250);
	display: -webkit-box;
	-webkit-line-clamp: 5;
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
