<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { useFocusGroup } from '@/composables/useFocusGroup';
import FallbackPoster from '@/components/cards/FallbackPoster.vue';
import SplitTitleText from '@/components/text/SplitTitleText.vue';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';
import type { NMHomeCardWrapper, Update } from './types';

/*
 * Hero card on home — matches APK NMHomeCard.kt's TV layout:
 *   Edge-to-edge backdrop, OverlayGradient scrim, Watch / Details
 *   buttons stacked in the left 60%. Each button is individually
 *   D-pad focusable (mirrors APK NMHomeCardLeftColumn LinkButtons).
 */
const props = defineProps<{
	id: string;
	data: NMHomeCardWrapper;
	update?: Update;
}>();

const router = useRouter();

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

const actionsEl = ref<HTMLElement | null>(null);
useFocusGroup({
	type: 'horizontal',
	restorationKey: `home-card-${props.id}`,
	containerEl: actionsEl,
});

const watchEl = ref<HTMLElement | null>(null);
const detailsEl = ref<HTMLElement | null>(null);

useFocusEntry({
	key: `${props.id}-watch`,
	el: watchEl,
	onAction: () => {
		if (watchPath.value)
			router.push(watchPath.value);
	},
});

useFocusEntry({
	key: `${props.id}-details`,
	el: detailsEl,
	onAction: () => {
		if (detailsPath.value)
			router.push(detailsPath.value);
	},
});
</script>

<template>
	<section class="hero" :data-card-id="id">
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
			<div v-if="props.data.season || props.data.episode" class="se">
				<span v-if="props.data.season">S{{ props.data.season }}</span>
				<span v-if="props.data.episode">E{{ props.data.episode }}</span>
			</div>
			<SplitTitleText
				:title="props.data.title"
				main-class="card-main"
				subtitle-class="card-sub"
			/>
			<p v-if="overview" class="overview">
				{{ overview }}
			</p>

			<div ref="actionsEl" class="actions">
				<button
					v-if="watchPath"
					ref="watchEl"
					type="button"
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
					type="button"
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
	display: block;
	width: 100%;
	height: 60vh;
	min-height: 320px;
	max-height: 432px;
	overflow: hidden;
	border: 0;
	background: oklch(0.12 0.01 250);
	padding: 0;
}
.art {
	position: absolute;
	inset: 0;
}
.art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: top;
}
.scrim {
	position: absolute;
	inset: 0;
	background: radial-gradient(
		ellipse 130% 130% at 80% -10%,
		transparent 0%,
		transparent 35%,
		rgba(0, 0, 0, 0.85) 75%,
		rgba(0, 0, 0, 1) 100%
	);
}
.content {
	position: absolute;
	inset: 0;
	width: 60%;
	padding: 32px var(--tv-safe-padding) 56px;
	color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: center;
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
.se {
	display: flex;
	gap: 4px;
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.05em;
	color: oklch(0.85 0.01 250);
}
:deep(.card-main) {
	font-size: 32px;
	font-weight: 700;
	line-height: 1.05;
	letter-spacing: -0.01em;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
:deep(.card-sub) {
	font-size: 20px;
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
	border: 2px solid transparent;
	cursor: pointer;
	outline: none;
	transition:
		transform var(--motion-fast),
		background var(--motion-fast),
		border-color var(--motion-fast);
}
.btn-primary {
	background: #fff;
	color: #181818;
}
.btn-primary:hover,
.btn-primary:focus-visible {
	background: oklch(0.95 0 0);
	transform: translateY(-1px);
	border-color: var(--color-primary, oklch(0.7 0.2 285));
}
.btn-secondary {
	background: rgba(0, 0, 0, 0.7);
	color: #fff;
	border: 1px solid rgba(255, 255, 255, 0.25);
}
.btn-secondary:hover,
.btn-secondary:focus-visible {
	background: rgba(0, 0, 0, 0.85);
	border-color: var(--color-primary, oklch(0.7 0.2 285));
	transform: translateY(-1px);
}
</style>
