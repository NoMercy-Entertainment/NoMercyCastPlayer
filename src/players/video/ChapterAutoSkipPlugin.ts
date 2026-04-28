/**
 * ChapterAutoSkipPlugin per spec §12.4. Mirrors android equivalent —
 * automatically skips intro / credits chapters when the user setting is
 * on, otherwise emits 'chapter-skip-available' so the WatchScreen can
 * surface a "Skip Intro" button.
 *
 * Receiver-side stub: instead of binding to the npm package's Plugin
 * base class (which expects construction via player.use()), we expose
 * an attach/detach pair that wires player events explicitly. This
 * works regardless of whether the npm package version on the receiver
 * actually exports a Plugin abstract class that matches our
 * expectations.
 */

interface PlayerLike {
	on: (event: string, handler: (data: unknown) => void) => void;
	off: (event: string, handler?: (data: unknown) => void) => void;
	emit?: (event: string, data?: unknown) => void;
	getCurrentChapter?: () =>
		| { id: string; type?: string; endTime?: number; startTime?: number }
		| null;
	seek: (seconds: number) => void;
}

let lastChapterId: string | null = null;
const unsubs: Array<() => void> = [];

let userPrefAutoSkip = false;
export function setAutoSkipEnabled(enabled: boolean): void {
	userPrefAutoSkip = enabled;
}

export function attachChapterAutoSkip(player: PlayerLike): void {
	const onTime = (): void => {
		const chapter = player.getCurrentChapter?.();
		if (!chapter || chapter.id === lastChapterId)
			return;

		if (chapter.type === 'credits' || chapter.type === 'intro') {
			if (userPrefAutoSkip && typeof chapter.endTime === 'number') {
				player.seek(chapter.endTime);
			}
			else {
				player.emit?.('chapter-skip-available', chapter);
			}
		}

		lastChapterId = chapter.id;
	};

	player.on('time', onTime);
	unsubs.push(() => player.off('time', onTime));
}

export function detachChapterAutoSkip(): void {
	while (unsubs.length > 0) {
		try {
			unsubs.pop()?.();
		}
		catch {
			// best-effort
		}
	}
	lastChapterId = null;
}
