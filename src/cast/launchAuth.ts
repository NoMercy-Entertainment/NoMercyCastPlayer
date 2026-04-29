import type { LaunchCustomData } from '@/types/cast';
import { authStore } from '@/stores/authStore';

/**
 * Parse LAUNCH customData → authStore.
 *
 * cast.framework.system.LaunchRequestEvent.data carries whatever the sender
 * passed in customData. We accept either a parsed object or a JSON string
 * (cast_shell occasionally hands the data as a string depending on
 * negotiation path).
 */
export function consumeLaunchAuth(raw: unknown): boolean {
	if (raw == null)
		return false;

	let data: LaunchCustomData;
	try {
		data
			= typeof raw === 'string' ? (JSON.parse(raw) as LaunchCustomData) : (raw as LaunchCustomData);
	}
	catch (err) {
		console.error('[cast] launch customData parse failed', err);
		return false;
	}

	if (!data.access_token || !data.refresh_token || !data.user_id) {
		console.warn('[cast] launch customData missing required auth fields', {
			hasAccess: Boolean(data.access_token),
			hasRefresh: Boolean(data.refresh_token),
			hasUserId: Boolean(data.user_id),
		});
		return false;
	}

	authStore.consumeLaunchAuth(data);
	return true;
}

/**
 * Pull the queued LaunchRequestEvent off the cast context if it arrived
 * before our handler attached. cast.framework caches the launch event and
 * replays it on first listener registration.
 *
 * Event names ('READY', 'SENDER_CONNECTED') are passed as strings —
 * @types/chromecast-caf-receiver declares EventType as a const enum which
 * isolatedModules forbids accessing through ambient namespaces.
 */
export function attachLaunchListener(
	context: { addEventListener: (type: string, listener: (event: unknown) => void) => void; getApplicationData: () => unknown },
	onIntent: (data: LaunchCustomData) => void,
): void {
	context.addEventListener('READY', (_event: unknown) => {
		const appData = context.getApplicationData() as
			| { customData?: unknown; launchOptions?: { customData?: unknown } }
			| null;
		const customData = appData?.customData ?? appData?.launchOptions?.customData;
		const diag = {
			hasCustomData: Boolean(customData),
			appDataKeys: appData ? Object.keys(appData) : null,
			launchOptionsKeys: appData?.launchOptions
				? Object.keys(appData.launchOptions)
				: null,
			customDataKeys: customData
				? Object.keys(customData as Record<string, unknown>)
				: null,
			customDataType: typeof customData,
		};
		// cast_shell filters console + title. URL changes ARE logged via
		// "Active URL: ..." entries — encode the diag in a hash fragment
		// so the navigation is non-disruptive but visible in logcat.
		const diagStr = JSON.stringify(diag);
		try {
			document.body.dataset.launchDiag = diagStr;
			window.history.replaceState(null, '', `#diag=${encodeURIComponent(diagStr)}`);
		}
		catch {
			window.history.replaceState(null, '', '#diag=stringify-failed');
		}
		if (customData) {
			const ok = consumeLaunchAuth(customData);
			window.history.replaceState(null, '', `#consume-ok=${ok}`);
			if (ok) {
				const stored = (customData as LaunchCustomData) ?? null;
				if (stored)
					onIntent(stored);
			}
		}
		else {
			window.history.replaceState(null, '', '#diag=no-customData');
		}
	});

	context.addEventListener('SENDER_CONNECTED', (event: unknown) => {
		console.debug('[cast] sender connected', { event });
	});
}
