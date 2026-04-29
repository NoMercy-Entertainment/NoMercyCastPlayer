import { mountPreScreen } from './pluginPanels/PreScreen';
import { mountEpisodeScreen } from './pluginPanels/EpisodeScreen';
import type { EpisodeItem } from './pluginPanels/EpisodeScreen';
import { mountLanguageScreen } from './pluginPanels/LanguageScreen';
import type { TrackItem } from './pluginPanels/LanguageScreen';
import { mountSeekContainer } from './pluginPanels/SeekContainer';

/**
 * TV overlay orchestrator per spec §12.3. Owns the pre-screen / episode
 * / language / seek panel lifecycle and routes player events to the
 * right panel. Ports the responsibility surface of
 * apps/nomercy-cast-player/.archive-v0/lib/VideoPlayer/plugins/UIPlugin/
 * tvUIPlugin.ts into a Vue-free, DOM-driven module.
 *
 * The npm @nomercy-entertainment/nomercy-video-player package's Plugin
 * base class shape varies across versions; this file does not extend it
 * directly. Instead we attach via the player's public on/off + overlay
 * surface so the receiver isn't pinned to a specific plugin contract.
 */

interface PlayerLike {
	overlay?: HTMLElement;
	on: (event: string, handler: (data?: unknown) => void) => void;
	off: (event: string, handler?: (data?: unknown) => void) => void;
	emit?: (event: string, data?: unknown) => void;
	play: () => void;
	pause: () => void;
	seek: (seconds: number) => void;
	restart?: () => void;
	getCurrentTime?: () => number;
	getDuration?: () => number;
	getAudioTrack?: () => string | number | null;
	getSubtitleTrack?: () => string | number | null;
	getAudioTracks?: () => TrackItem[];
	getSubtitleTracks?: () => TrackItem[];
	getQualityLevels?: () => TrackItem[];
	getCurrentQuality?: () => string | number | null;
	getActualQualityLabel?: () => string | null;
	setAudioTrack?: (id: string | number) => void;
	setSubtitleTrack?: (id: string | number) => void;
	setQuality?: (id: string | number) => void;
	playlist?: () => EpisodeItem[];
	playlistItem?: () => {
		id: number | string;
		title: string;
		subtitle?: string;
		overview?: string;
		backdrop?: string | null;
		resumeFromMs?: number;
	};
	getAutoSkipChapters?: () => boolean;
	setAutoSkipChapters?: (next: boolean) => void;
}

export interface TVOverlayPluginOptions {
	skipPreScreen?: boolean;
}

export class TVOverlayPlugin {
	private currentPanel: 'pre' | 'episode' | 'language' | 'seek' | null = null;
	private unmount: (() => void) | null = null;
	private boundHandlers: Array<{ event: string; handler: (data?: unknown) => void }> = [];

	constructor(
		private readonly player: PlayerLike,
		private readonly opts: TVOverlayPluginOptions = {},
	) {}

	attach(): void {
		if (!this.opts.skipPreScreen)
			this.showPreScreen();

		this.bind('back-button', () => this.handleBack());
		this.bind('show-language-screen', () => this.showLanguageScreen());
		this.bind('show-episode-screen', () => this.showEpisodeScreen());
		this.bind('pause', () => this.maybeShowPreScreen());
		this.bind('play', () => this.closeAllPanels());
	}

	detach(): void {
		this.closeAllPanels();
		for (const { event, handler } of this.boundHandlers) {
			this.player.off(event, handler);
		}
		this.boundHandlers = [];
	}

	private bind(event: string, handler: (data?: unknown) => void): void {
		this.player.on(event, handler);
		this.boundHandlers.push({ event, handler });
	}

	private overlayHost(): HTMLElement | null {
		return this.player.overlay ?? null;
	}

	private showPreScreen(): void {
		const host = this.overlayHost();
		if (!host)
			return;
		this.closeAllPanels();
		const item = this.player.playlistItem?.();
		this.currentPanel = 'pre';
		this.unmount = mountPreScreen({
			parent: host,
			title: item?.title ?? 'Now playing',
			subtitle: item?.subtitle,
			overview: item?.overview,
			backdropUrl: item?.backdrop ?? null,
			resumeFromMs: item?.resumeFromMs ?? 0,
			showEpisodes: (this.player.playlist?.()?.length ?? 0) > 1,
			showLanguages: Boolean(this.player.getAudioTracks?.() || this.player.getSubtitleTracks?.()),
			onPlay: () => {
				this.closeAllPanels();
				this.player.play();
			},
			onRestart: () => {
				this.closeAllPanels();
				if (this.player.restart)
					this.player.restart();
				else this.player.seek(0);
				this.player.play();
			},
			onShowEpisodes: () => this.showEpisodeScreen(),
			onShowLanguages: () => this.showLanguageScreen(),
			onExit: () => this.player.emit?.('back'),
		});
	}

	private showEpisodeScreen(): void {
		const host = this.overlayHost();
		if (!host)
			return;
		this.closeAllPanels();
		this.currentPanel = 'episode';
		const episodes = this.player.playlist?.() ?? [];
		const current = this.player.playlistItem?.();
		const currentTimeSec = this.player.getCurrentTime?.() ?? 0;
		this.unmount = mountEpisodeScreen({
			parent: host,
			episodes,
			currentId: current?.id,
			currentTimeMs: Math.round(currentTimeSec * 1000),
			onPick: (item) => {
				this.closeAllPanels();
				this.player.emit?.('load-item', item);
			},
			onExit: () => this.showPreScreen(),
		});
	}

	private showLanguageScreen(): void {
		const host = this.overlayHost();
		if (!host)
			return;
		this.closeAllPanels();
		this.currentPanel = 'language';
		this.unmount = mountLanguageScreen({
			parent: host,
			audioTracks: this.player.getAudioTracks?.() ?? [],
			subtitleTracks: this.player.getSubtitleTracks?.() ?? [],
			qualityLevels: this.player.getQualityLevels?.() ?? [],
			currentAudioId: this.player.getAudioTrack?.(),
			currentSubtitleId: this.player.getSubtitleTrack?.(),
			currentQualityId: this.player.getCurrentQuality?.() ?? -1,
			autoQualityLabel: this.player.getActualQualityLabel?.() ?? null,
			autoSkipChapters: this.player.getAutoSkipChapters?.() ?? false,
			onPickAudio: id => this.player.setAudioTrack?.(id),
			onPickSubtitle: (id) => {
				if (id === 'off')
					this.player.setSubtitleTrack?.('');
				else this.player.setSubtitleTrack?.(id);
			},
			onPickQuality: this.player.setQuality
				? id => this.player.setQuality?.(id)
				: undefined,
			onToggleAutoSkip: this.player.setAutoSkipChapters
				? next => this.player.setAutoSkipChapters?.(next)
				: undefined,
			onExit: () => this.showPreScreen(),
		});
	}

	showSeekContainer(): void {
		const host = this.overlayHost();
		if (!host)
			return;
		if (this.currentPanel === 'seek')
			return;
		this.closeAllPanels();
		this.currentPanel = 'seek';
		this.unmount = mountSeekContainer({
			parent: host,
			getCurrentTime: () => this.player.getCurrentTime?.() ?? 0,
			getDuration: () => this.player.getDuration?.() ?? 0,
			onCommit: (seconds) => {
				this.player.seek(seconds);
				this.closeAllPanels();
			},
			onCancel: () => this.closeAllPanels(),
		});
	}

	private maybeShowPreScreen(): void {
		if (this.currentPanel === null)
			this.showPreScreen();
	}

	private handleBack(): void {
		if (this.currentPanel === 'episode' || this.currentPanel === 'language') {
			this.showPreScreen();
		}
		else if (this.currentPanel === 'seek') {
			this.closeAllPanels();
		}
		else if (this.currentPanel === 'pre') {
			this.player.emit?.('back');
		}
		else {
			this.player.pause();
			this.showPreScreen();
		}
	}

	private closeAllPanels(): void {
		try {
			this.unmount?.();
		}
		catch {
			// best-effort
		}
		this.unmount = null;
		this.currentPanel = null;
	}
}
