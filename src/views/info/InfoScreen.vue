<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { useInfoQuery } from '@/queries/useInfoQuery';
import type { InfoData } from '@/queries/useInfoQuery';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { BACKDROP_SIZE, buildImageUrl } from '@/lib/images/urls';
import SplitTitleText from '@/components/text/SplitTitleText.vue';
import LoadingIndicator from '@/components/feedback/LoadingIndicator.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';
import { apiFetch } from '@/lib/http/client';
import { QueryKeys } from '@/queries/keys';

/*
 * Movie / TV detail page. Mirrors APK InfoScreen.kt:
 *   - BackdropImageWithOverlay full-bleed
 *   - HeroRow at top: logo (or title) + overview, height ~366dp
 *   - Below hero: Watch / Trailer / Add-to-Watchlist buttons stacked
 *     left, right column reserved (cast / seasons land in a follow-up)
 */
const props = defineProps<{
	type: string;
	id: string;
}>();
const API_PREFIX = /^\/api\/v1\//;
const LEADING_SLASH = /^\//;

const router = useRouter();
const { type, id } = toRefs(props);

const { data, isLoading, error, refetch } = useInfoQuery(type, id);

const info = computed(() => data.value ?? null);

const backdropUrl = computed(() =>
	buildImageUrl(info.value?.backdrop ?? null, BACKDROP_SIZE),
);

const logoUrl = computed(() => buildImageUrl(info.value?.logo ?? null, { width: 600 }));

const watchPath = computed(() => {
	const link = info.value?.link;
	if (!link)
		return null;
	return link.endsWith('/watch') ? link : `${link}/watch`;
});

const hasTrailer = computed(() =>
	(info.value?.videos ?? []).some(
		v => v.site?.toLowerCase() === 'youtube' && v.type?.toLowerCase() === 'trailer',
	),
);

const watchlistLabel = computed(() =>
	info.value?.watchlist ? 'Remove from watchlist' : 'Add to watchlist',
);

const yearText = computed(() => (info.value?.year ? String(info.value.year) : ''));
const durationText = computed(() => {
	const d = info.value?.duration;
	if (typeof d === 'number')
		return `${Math.round(d / 60)} min`;
	return d ? String(d) : '';
});
const ratingText = computed(() =>
	typeof info.value?.voteAverage === 'number'
		? `${info.value.voteAverage.toFixed(1)} / 10`
		: '',
);

const actionsEl = ref<HTMLElement | null>(null);
const actionsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'info-actions',
	containerEl: actionsEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge(actionsGroup);

const watchEl = ref<HTMLElement | null>(null);
const trailerEl = ref<HTMLElement | null>(null);
const watchlistEl = ref<HTMLElement | null>(null);

useFocusEntry({
	key: 'info-watch',
	el: watchEl,
	onAction: () => {
		if (watchPath.value)
			router.push(watchPath.value);
	},
});

useFocusEntry({
	key: 'info-trailer',
	el: trailerEl,
	onAction: () => {
		// Trailer overlay player lands in a follow-up; for now no-op.
	},
});

const queryClient = useQueryClient();
const isPostingWatchlist = ref(false);

useFocusEntry({
	key: 'info-watchlist',
	el: watchlistEl,
	onAction: () => {
		void toggleWatchlist();
	},
});

async function toggleWatchlist(): Promise<void> {
	if (isPostingWatchlist.value || !info.value?.link)
		return;
	isPostingWatchlist.value = true;
	const link = info.value.link;
	const newValue = !info.value.watchlist;
	const queryKey = [...QueryKeys.info(type.value, id.value)];

	queryClient.setQueryData<InfoData>(queryKey, (prev) => {
		if (!prev)
			return prev;
		return { ...prev, watchlist: newValue };
	});

	try {
		const cleanLink = link.replace(API_PREFIX, '').replace(LEADING_SLASH, '');
		await apiFetch<{ status?: string }>({
			path: `/api/v1/${cleanLink}/watch-list`,
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ add: newValue }),
		});
	}
	catch {
		queryClient.setQueryData<InfoData>(queryKey, (prev) => {
			if (!prev)
				return prev;
			return { ...prev, watchlist: !newValue };
		});
	}
	finally {
		isPostingWatchlist.value = false;
	}
}
</script>

<template>
	<LoadingIndicator v-if="isLoading && !info" />
	<ErrorPanel
		v-else-if="error"
		:error="error as Error"
		:retry="() => refetch()"
		context="Couldn't load details"
	/>
	<section v-else-if="info" class="info-screen">
		<div class="backdrop">
			<img
				v-if="backdropUrl"
				:src="backdropUrl"
				:alt="info.title ?? ''"
				loading="eager"
				decoding="async"
			>
			<div class="scrim" />
		</div>

		<div class="hero-row">
			<img
				v-if="logoUrl"
				class="logo"
				:src="logoUrl"
				:alt="info.title ?? ''"
				loading="eager"
				decoding="async"
			>
			<SplitTitleText
				v-else
				:title="info.title"
				main-class="info-title-main"
				subtitle-class="info-title-sub"
			/>

			<div v-if="yearText || durationText || ratingText" class="meta-row">
				<span v-if="yearText">{{ yearText }}</span>
				<span v-if="durationText">·</span>
				<span v-if="durationText">{{ durationText }}</span>
				<span v-if="ratingText">·</span>
				<span v-if="ratingText">{{ ratingText }}</span>
			</div>

			<p v-if="info.overview" class="overview">
				{{ info.overview }}
			</p>
		</div>

		<div ref="actionsEl" class="actions">
			<button
				v-if="watchPath"
				ref="watchEl"
				class="btn btn-primary"
				data-focusable
				tabindex="0"
				@click.prevent="watchPath && router.push(watchPath)"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M8 5v14l11-7z" />
				</svg>
				Watch
			</button>
			<button
				v-if="hasTrailer"
				ref="trailerEl"
				class="btn btn-secondary"
				data-focusable
				tabindex="0"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
				</svg>
				Watch trailer
			</button>
			<button
				ref="watchlistEl"
				class="btn btn-secondary"
				data-focusable
				tabindex="0"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						v-if="info.watchlist"
						d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
						fill="currentColor"
					/>
					<path
						v-else
						d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
					/>
				</svg>
				{{ watchlistLabel }}
			</button>
		</div>
	</section>
</template>

<style scoped>
.info-screen {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	color: #fff;
}
.backdrop {
	position: absolute;
	inset: 0;
}
.backdrop img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.scrim {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.2) 100%),
		linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
}
.hero-row {
	position: relative;
	z-index: 1;
	padding: 80px 36px 24px 40px;
	max-width: 720px;
}
.logo {
	max-width: 280px;
	max-height: 140px;
	object-fit: contain;
	margin-bottom: 16px;
	filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5));
}
:deep(.info-title-main) {
	margin-bottom: 16px;
	font-size: 36px;
	font-weight: 700;
	line-height: 1.05;
	letter-spacing: -0.01em;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
:deep(.info-title-sub) {
	margin-bottom: 16px;
	font-size: 22px;
	font-weight: 500;
	color: oklch(0.92 0.005 250);
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}
.meta-row {
	display: flex;
	gap: 8px;
	font-size: 14px;
	color: oklch(0.85 0.01 250);
	margin-bottom: 12px;
	letter-spacing: 0.02em;
}
.overview {
	margin: 0;
	font-size: 15px;
	line-height: 1.5;
	color: oklch(0.95 0.005 250);
	display: -webkit-box;
	-webkit-line-clamp: 8;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.actions {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 0 40px;
	max-width: 560px;
}
.btn {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 12px 22px;
	border-radius: 999px;
	font-size: 14px;
	font-weight: 600;
	border: 0;
	cursor: pointer;
	outline: none;
	transition:
		transform var(--motion-fast),
		background var(--motion-fast);
	text-align: left;
}
.btn-primary {
	background: #fff;
	color: #181818;
}
.btn-primary:focus-visible,
.btn-primary:hover {
	background: oklch(0.95 0 0);
	transform: translateY(-1px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}
.btn-secondary {
	background: rgba(0, 0, 0, 0.7);
	color: #fff;
	border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-secondary:focus-visible,
.btn-secondary:hover {
	background: rgba(0, 0, 0, 0.85);
	border-color: rgba(255, 255, 255, 0.55);
	transform: translateY(-1px);
}
</style>
