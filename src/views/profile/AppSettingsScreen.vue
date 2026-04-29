<script setup lang="ts">
import { ref } from 'vue';
import { useFocusGroup } from '@/composables/useFocusGroup';
import { useFocusEntry } from '@/composables/useFocusEntry';
import { focusTopnav, useNavFocusBridge } from '@/composables/useNavFocusBridge';

/*
 * App settings — mirrors APK AppSettingsScreen.kt's TvToggleRow stack
 * with the auto-theme-color toggle. Persistence layer is per-user on
 * the server-side AppConfigStore in the APK; on the receiver these
 * toggles are session-local placeholders until the cast spec extends.
 */
const containerEl = ref<HTMLElement | null>(null);
const settingsGroup = useFocusGroup({
	type: 'vertical',
	restorationKey: 'settings-list',
	containerEl,
	onEscape: dir => (dir === 'up' ? focusTopnav() : false),
});

useNavFocusBridge(settingsGroup);

const useAutoThemeColors = ref(true);
const enableSubtitleHints = ref(true);

const themeEl = ref<HTMLElement | null>(null);
const subtitleEl = ref<HTMLElement | null>(null);

useFocusEntry({
	key: 'settings-theme',
	el: themeEl,
	onAction: () => {
		useAutoThemeColors.value = !useAutoThemeColors.value;
	},
});

useFocusEntry({
	key: 'settings-subs',
	el: subtitleEl,
	onAction: () => {
		enableSubtitleHints.value = !enableSubtitleHints.value;
	},
});
</script>

<template>
	<div class="settings-screen">
		<header class="page-header">
			<h1>Settings</h1>
		</header>
		<div ref="containerEl" class="list">
			<button
				ref="themeEl"
				class="row"
				data-focusable
				tabindex="0"
				@click.prevent="useAutoThemeColors = !useAutoThemeColors"
			>
				<div class="row-text">
					<p class="row-primary">
						Use auto theme colours
					</p>
					<p class="row-secondary">
						Pull accent from the focused poster's palette
					</p>
				</div>
				<span class="toggle" :class="[{ on: useAutoThemeColors }]">
					<span class="thumb" />
				</span>
			</button>

			<button
				ref="subtitleEl"
				class="row"
				data-focusable
				tabindex="0"
				@click.prevent="enableSubtitleHints = !enableSubtitleHints"
			>
				<div class="row-text">
					<p class="row-primary">
						Subtitle hints
					</p>
					<p class="row-secondary">
						Show subtitle availability badge on cards
					</p>
				</div>
				<span class="toggle" :class="[{ on: enableSubtitleHints }]">
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
	scrollbar-width: none;
	padding: 32px;
}
.settings-screen::-webkit-scrollbar {
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
