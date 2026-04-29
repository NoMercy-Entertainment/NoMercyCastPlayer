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
					class="nm-cover-top"
					:src="backdropUrl"
					:alt="card.title ?? ''"
					loading="eager"
					decoding="async"
				>
				<div class="nm-hero-scrim" />
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
	height: 60vh;
	overflow: hidden;
	background: oklch(0.12 0.01 250);
}
.art {
	position: absolute;
	inset: 0;
}
.content {
	position: absolute;
	inset: 0;
	width: 60%;
	padding: 20px 16px 32px 40px;
	color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 12px;
}
.logo {
	max-width: 420px;
	max-height: 96px;
	object-fit: contain;
	object-position: left center;
	filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
}
/* APK HeroRow uses SemiBold 28sp main, Medium 19sp sub */
:deep(.hero-main) {
	font-size: 28px;
	font-weight: 600;
	line-height: 1.1;
	letter-spacing: -0.005em;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
:deep(.hero-sub) {
	font-size: 19px;
	font-weight: 500;
	line-height: 1.2;
	color: oklch(0.92 0.005 250);
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}
.overview {
	margin: 0;
	font-size: 19px;
	font-weight: 600;
	line-height: 20px;
	color: oklch(1 0 0);
	display: -webkit-box;
	-webkit-line-clamp: 5;
	-webkit-box-orient: vertical;
	overflow: hidden;
	max-width: 600px;
	text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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
