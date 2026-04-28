import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { CastIntent } from '@/types/cast';

/**
 * Navigation store — translates LAUNCH intents and post-LAUNCH sender pushes
 * into router actions. Phase 1 only handles the initial intent dispatch;
 * post-LAUNCH sender intents wire up in Phase 2 (custom namespace) and
 * Phase 4 (route table).
 */

const lastIntent = ref<CastIntent | null>(null);

export function dispatchInitialIntent(intent: CastIntent, router: Router): void {
	lastIntent.value = intent;
	switch (intent.type) {
		case 'play_video':
			// Watch route lands in Phase 9. For now park on splash with intent
			// recorded so a future router can pick it up.
			void router.push({
				path: `/watch/${intent.media_type}/${intent.media_id}`,
				query: intent.resume_at ? { resume_at: String(intent.resume_at) } : undefined,
			});
			break;
		case 'play_music':
			// Music player route lands in Phase 8.
			void router.push({
				path: '/now-playing',
				query: {
					list_type: intent.list_type,
					list_id: intent.list_id,
					...(intent.track_id ? { track_id: intent.track_id } : {}),
					...(intent.resume_at ? { resume_at: String(intent.resume_at) } : {}),
				},
			});
			break;
		case 'navigate':
			void router.push(intent.route);
			break;
		case 'idle':
		default:
			void router.push('/');
			break;
	}
}

export const navStore = {
	lastIntent,
	dispatchInitialIntent,
};
