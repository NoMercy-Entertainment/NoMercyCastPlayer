<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';
import type { NMHomeCardWrapper, Update } from './types';

/*
 * Hero card on home — matches APK NMHomeCard.kt's TV layout:
 *   Edge-to-edge backdrop (TMDB w1280), gradient overlay anchored bottom-left,
 *   title + 7-line overview + Watch / Details buttons stacked in the left 60%
 *   of the card. Right column reserved for visual breathing room (and a
 *   trailer overlay slot in a follow-up).
 */
const props = defineProps<{
	id: string;
	data: NMHomeCardWrapper;
	update?: Update;
}>();

const router = useRouter();
const el = ref<HTMLElement | null>(null);

// Server payload uses backdrop / poster / image depending on the row context;
// the hero on home prefers backdrop. Falls through poster → image otherwise.
const imageSource
	= (props.data as unknown as { backdrop?: string }).backdrop
		?? (props.data as unknown as { poster?: string }).poster
		?? props.data.image;
const imageUrl = computed(() => buildImageUrl(imageSource, BACKDROP_SIZE));

const overview = computed(
	() =>
		(props.data as unknown as { overview?: string; description?: string }).overview
		?? props.data.description
		?? '',
);

const watchPath = computed(() => {
	const link = props.data.link;
	if (!link)
		return null;
	return link.endsWith('/watch') ? link : `${link}/watch`;
});

const detailsPath = computed(() => props.data.link ?? null);

useFocusEntry({
	key: props.id,
	el,
	onAction: () => {
		if (watchPath.value)
			router.push(watchPath.value);
	},
});

function handleWatch(): void {
	if (watchPath.value)
		router.push(watchPath.value);
}

function handleDetails(): void {
	if (detailsPath.value)
		router.push(detailsPath.value);
}
</script>

<template>
	<article ref="el" class="hero" data-focusable tabindex="0" role="button">
		<div class="art">
			<img
				v-if="imageUrl"
				:src="imageUrl"
				:alt="props.data.title ?? ''"
				loading="eager"
				decoding="async"
			>
			<FallbackPoster v-else :title="props.data.title" />
			<div class="scrim" />
		</div>

		<div class="content">
			<p v-if="props.data.show" class="show">
				{{ props.data.show }}
			</p>
			<h1 class="title">
				<span v-if="props.data.season">S{{ props.data.season }} </span>
				<span v-if="props.data.episode">E{{ props.data.episode }} </span>
				{{ props.data.title }}
			</h1>
			<p v-if="overview" class="overview">
				{{ overview }}
			</p>

			<div class="actions">
				<button
					v-if="watchPath"
					class="btn btn-primary"
					data-focusable
					tabindex="0"
					@click.prevent="handleWatch"
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
					class="btn btn-secondary"
					data-focusable
					tabindex="0"
					@click.prevent="handleDetails"
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
	</article>
</template>

<style scoped>
.hero {
	position: relative;
	display: block;
	width: 100%;
	height: 60vh;
	min-height: 320px;
	max-height: 432px;
	overflow: hidden;
	border: 0;
	background: oklch(0.12 0.01 250);
	padding: 0;
	cursor: pointer;
	outline: none;
}
.hero:focus-visible {
	outline: 3px solid var(--color-primary, oklch(0.7 0.2 285));
	outline-offset: -3px;
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
/*
 * Bottom-left scrim mirroring the APK's OverlayGradient — readable text
 * on top of the backdrop without covering the full image.
 */
.scrim {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 45%, transparent 70%),
		linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
}
.content {
	position: absolute;
	inset: auto 0 0 0;
	width: 60%;
	padding: 24px 36px 32px;
	color: #fff;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.show {
	margin: 0;
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: oklch(0.85 0.01 250);
}
.title {
	margin: 0;
	font-size: 32px;
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
	max-width: 560px;
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
	transition:
		transform var(--motion-fast),
		background var(--motion-fast);
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
