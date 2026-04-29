<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';

/*
 * Hero pinned to the top of the home view. Mirrors APK
 * VideoMusicHeroSection.kt — backdrop image full-bleed, gradient scrim
 * anchored bottom-left, title + overview + Watch / Details buttons in
 * the left 60% of the card.
 */

interface CardData {
	title?: string;
	overview?: string;
	backdrop?: string;
	poster?: string;
	link?: string;
	year?: number;
	type?: string;
}

const props = defineProps<{
	card: CardData;
}>();

const router = useRouter();
const watchEl = ref<HTMLElement | null>(null);
const detailsEl = ref<HTMLElement | null>(null);

const backdropUrl = computed(() =>
	buildImageUrl(props.card.backdrop ?? props.card.poster ?? null, BACKDROP_SIZE),
);

const watchPath = computed(() => {
	const link = props.card.link;
	if (!link)
		return null;
	return link.endsWith('/watch') ? link : `${link}/watch`;
});

const detailsPath = computed(() => props.card.link ?? null);

useFocusEntry({
	key: 'home-hero-watch',
	el: watchEl,
	onAction: () => {
		if (watchPath.value)
			router.push(watchPath.value);
	},
});

useFocusEntry({
	key: 'home-hero-details',
	el: detailsEl,
	onAction: () => {
		if (detailsPath.value)
			router.push(detailsPath.value);
	},
});
</script>

<template>
	<section class="hero">
		<div class="art">
			<img
				v-if="backdropUrl"
				:src="backdropUrl"
				:alt="card.title ?? ''"
				loading="eager"
				decoding="async"
			>
			<div class="scrim" />
		</div>

		<div class="content">
			<h1 class="title">
				{{ card.title }}
			</h1>
			<p v-if="card.overview" class="overview">
				{{ card.overview }}
			</p>
			<div class="actions">
				<button
					v-if="watchPath"
					ref="watchEl"
					class="btn btn-primary"
					data-focusable
					tabindex="0"
					@click.prevent="watchPath && router.push(watchPath)"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M8 5v14l11-7z" />
					</svg>
					Watch
				</button>
				<button
					v-if="detailsPath"
					ref="detailsEl"
					class="btn btn-secondary"
					data-focusable
					tabindex="0"
					@click.prevent="detailsPath && router.push(detailsPath)"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="16" x2="12" y2="12" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
					</svg>
					Details
				</button>
			</div>
		</div>
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
	-webkit-line-clamp: 5;
	-webkit-box-orient: vertical;
	overflow: hidden;
	max-width: 600px;
}
.actions {
	display: flex;
	gap: 12px;
	margin-top: 8px;
}
.btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 22px;
	border-radius: 999px;
	font-size: 14px;
	font-weight: 600;
	border: 0;
	cursor: pointer;
	outline: none;
	transition: transform var(--motion-fast), background var(--motion-fast);
}
.btn-primary {
	background: #fff;
	color: #181818;
}
.btn-primary:hover,
.btn-primary:focus-visible {
	background: oklch(0.95 0 0);
	transform: translateY(-1px);
}
.btn-secondary {
	background: rgba(0, 0, 0, 0.7);
	color: #fff;
	border: 1px solid rgba(255, 255, 255, 0.25);
}
.btn-secondary:hover,
.btn-secondary:focus-visible {
	background: rgba(0, 0, 0, 0.85);
	border-color: rgba(255, 255, 255, 0.5);
	transform: translateY(-1px);
}
</style>
