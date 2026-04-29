<script setup lang="ts">
import { ref } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';
import { settingsStore } from '@/stores/settingsStore';

/*
 * App settings — mirrors APK preferences/display/tv/AppSettingsScreen.kt:
 *   - Auto-skip chapters toggle (intro / credits)
 *   - Auto theme colours toggle (palette-tinted accent)
 *   - Subtitle hints toggle (badge cards with subs available)
 *
 * Settings persist to localStorage via settingsStore. The auto-skip
 * pref drives ChapterAutoSkipPlugin's userPrefAutoSkip flag.
 */
const containerEl = ref<HTMLElement | null>(null);
const settingsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'settings-list',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge(settingsGroup);

const autoSkipEl = ref<HTMLElement | null>(null);
const themeEl = ref<HTMLElement | null>(null);
const subtitleEl = ref<HTMLElement | null>(null);

useFocusEntry({
	key: 'settings-auto-skip',
	el: autoSkipEl,
	onAction: () => {
		settingsStore.autoSkipChapters.value = !settingsStore.autoSkipChapters.value;
	},
});

useFocusEntry({
	key: 'settings-theme',
	el: themeEl,
	onAction: () => {
		settingsStore.useAutoThemeColors.value = !settingsStore.useAutoThemeColors.value;
	},
});

useFocusEntry({
	key: 'settings-subs',
	el: subtitleEl,
	onAction: () => {
		settingsStore.subtitleHints.value = !settingsStore.subtitleHints.value;
	},
});
</script>

<template>
	<div class="settings-screen nm-no-scrollbar">
		<header class="nm-page-header">
			<h1>Settings</h1>
		</header>
		<div ref="containerEl" class="list">
			<button
				ref="autoSkipEl"
				class="row"
				data-focusable
				tabindex="0"
				@click.prevent="settingsStore.autoSkipChapters.value = !settingsStore.autoSkipChapters.value"
			>
				<div class="row-text">
					<p class="row-primary">
						Auto-skip intros and credits
					</p>
					<p class="row-secondary">
						When a chapter is tagged as intro or credits, jump to the end automatically
					</p>
				</div>
				<span class="toggle" :class="[{ on: settingsStore.autoSkipChapters.value }]">
					<span class="thumb" />
				</span>
			</button>

			<button
				ref="themeEl"
				class="row"
				data-focusable
				tabindex="0"
				@click.prevent="settingsStore.useAutoThemeColors.value = !settingsStore.useAutoThemeColors.value"
			>
				<div class="row-text">
					<p class="row-primary">
						Use auto theme colours
					</p>
					<p class="row-secondary">
						Pull accent from the focused poster's palette
					</p>
				</div>
				<span class="toggle" :class="[{ on: settingsStore.useAutoThemeColors.value }]">
					<span class="thumb" />
				</span>
			</button>

			<button
				ref="subtitleEl"
				class="row"
				data-focusable
				tabindex="0"
				@click.prevent="settingsStore.subtitleHints.value = !settingsStore.subtitleHints.value"
			>
				<div class="row-text">
					<p class="row-primary">
						Subtitle hints
					</p>
					<p class="row-secondary">
						Show subtitle availability badge on cards
					</p>
				</div>
				<span class="toggle" :class="[{ on: settingsStore.subtitleHints.value }]">
					<span class="thumb" />
				</span>
			</button>
		</div>
	</div>
</template>

<style scoped>
.settings-screen {
	height: 100%;
	overflow-y: auto;
	padding: 32px;
}
.list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-width: 920px;
	margin: 0 auto;
}
.row {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background: oklch(0.18 0.01 250 / 0.85);
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 12px;
	color: #fff;
	font-family: inherit;
	cursor: pointer;
	outline: none;
	transition: border-color var(--motion-fast);
}
.row:focus-visible {
	border-color: rgba(255, 255, 255, 0.85);
	border-width: 3px;
}
.row-text {
	flex: 1;
	text-align: left;
}
.row-primary {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}
.row-secondary {
	margin: 4px 0 0;
	font-size: 12px;
	color: oklch(0.85 0.005 250);
}
.toggle {
	width: 44px;
	height: 24px;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.18);
	position: relative;
	transition: background var(--motion-fast);
}
.toggle.on {
	background: var(--color-primary, oklch(0.7 0.2 285));
}
.thumb {
	position: absolute;
	top: 2px;
	left: 2px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: #fff;
	transition: transform var(--motion-fast);
}
.toggle.on .thumb {
	transform: translateX(20px);
}
</style>
