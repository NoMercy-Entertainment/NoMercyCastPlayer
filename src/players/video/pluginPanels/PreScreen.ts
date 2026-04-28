/**
 * PreScreen panel — pre-play screen with Play / Restart / Episodes /
 * Audio+subs buttons. Mounted as a fullscreen overlay over the video
 * element when the player isn't actively playing. Mirrors android
 * Leanback PreScreen.
 *
 * Phase 9 ships a minimal but working DOM-driven panel — not Vue, since
 * the npm video-player package wants raw DOM elements as overlay
 * children. Keeps the bridge thin and avoids a Vue mini-app per panel.
 */

import { dispatchOptionAction } from './shared';

export interface PreScreenOptions {
	parent: HTMLElement;
	title: string;
	showEpisodes: boolean;
	showLanguages: boolean;
	onPlay: () => void;
	onRestart: () => void;
	onShowEpisodes: () => void;
	onShowLanguages: () => void;
	onExit: () => void;
}

export function mountPreScreen(opts: PreScreenOptions): () => void {
	const root = document.createElement('div');
	root.className = 'panel pre-screen';
	root.setAttribute('role', 'dialog');
	root.setAttribute('aria-label', 'Pre-play menu');

	const title = document.createElement('h1');
	title.textContent = opts.title;
	title.className = 'pre-screen-title';

	const buttonRow = document.createElement('div');
	buttonRow.className = 'pre-screen-buttons';

	const playBtn = makeButton('Play', () => opts.onPlay());
	const restartBtn = makeButton('Restart', () => opts.onRestart());
	buttonRow.append(playBtn, restartBtn);
	if (opts.showEpisodes) {
		const ep = makeButton('Episodes', () => opts.onShowEpisodes());
		buttonRow.append(ep);
	}
	if (opts.showLanguages) {
		const lang = makeButton('Audio and subtitles', () => opts.onShowLanguages());
		buttonRow.append(lang);
	}

	root.append(title, buttonRow);
	opts.parent.append(root);

	// Auto-focus play.
	requestAnimationFrame(() => playBtn.focus());

	// Back closes the panel.
	const onKey = (e: KeyboardEvent): void => {
		if (e.key === 'Escape' || e.key === 'Back' || e.key === 'GoBack' || e.key === 'BrowserBack') {
			e.preventDefault();
			opts.onExit();
		}
	};
	root.addEventListener('keydown', onKey, true);

	// Arrow-key navigation between buttons within the row.
	dispatchOptionAction(root, buttonRow, 'horizontal');

	return (): void => {
		root.removeEventListener('keydown', onKey, true);
		root.remove();
	};
}

function makeButton(label: string, onClick: () => void): HTMLButtonElement {
	const b = document.createElement('button');
	b.type = 'button';
	b.className = 'panel-button';
	b.dataset.focusable = 'true';
	b.tabIndex = 0;
	b.textContent = label;
	b.addEventListener('click', () => onClick());
	return b;
}
