import { computed, ref } from 'vue';
import type { LaunchCustomData, ReceiverState } from '@/types/cast';
import { decodeJwt, getJwtExpiryMs } from '@/lib/jwt';
import { refreshCastSession } from '@/lib/keycloak/refresh';

/**
 * Volatile in-memory auth store per spec §3.2 + §8.6.
 *
 * - Tokens live in `ref()` only — no localStorage / IndexedDB / cookies.
 * - Refresh loop scheduled to fire 30s before access_token expiry.
 * - On refresh failure: receiverState transitions to DEGRADED (only auth
 *   failure triggers this; SignalR connection failure does NOT).
 * - Process death = credentials gone. Next launch from any sender brings
 *   fresh tokens.
 */

const accessToken = ref<string | null>(null);
const refreshToken = ref<string | null>(null);
const userId = ref<string | null>(null);
const serverId = ref<string | null>(null);
const serverUrl = ref<string | null>(null);
const deviceId = ref<string | null>(null);
const castSessionId = ref<string | null>(null);
const launchTimestamp = ref<number | null>(null);
const locale = ref<string>('en-US');
const receiverState = ref<ReceiverState>('LOADING');

let refreshTimer: number | null = null;

const ready = computed(
	() => accessToken.value !== null && refreshToken.value !== null && userId.value !== null,
);

const expiresAtMs = computed(() => {
	if (!accessToken.value)
		return null;
	return getJwtExpiryMs(accessToken.value);
});

const userClaims = computed(() => {
	if (!accessToken.value)
		return null;
	return decodeJwt(accessToken.value);
});

function scheduleRefresh(): void {
	if (refreshTimer !== null) {
		window.clearTimeout(refreshTimer);
		refreshTimer = null;
	}
	const exp = expiresAtMs.value;
	if (exp === null)
		return;

	// Fire 30s before expiry. Floor at 5s to avoid tight loops if a token
	// arrives already near-expired.
	const msUntilRefresh = Math.max(exp - Date.now() - 30_000, 5_000);
	refreshTimer = window.setTimeout(() => void runRefresh(), msUntilRefresh);
}

async function runRefresh(): Promise<void> {
	if (!refreshToken.value) {
		receiverState.value = 'DEGRADED';
		return;
	}
	try {
		const result = await refreshCastSession(refreshToken.value);
		accessToken.value = result.access_token;
		refreshToken.value = result.refresh_token;
		scheduleRefresh();
	}
	catch (err) {
		console.error('[auth] refresh failed', err);
		receiverState.value = 'DEGRADED';
	}
}

function consumeLaunchAuth(data: LaunchCustomData): void {
	accessToken.value = data.access_token;
	refreshToken.value = data.refresh_token;
	userId.value = data.user_id;
	serverId.value = data.server_id;
	serverUrl.value = data.server_url;
	deviceId.value = data.device_id;
	castSessionId.value = data.cast_session_id;
	launchTimestamp.value = data.launch_timestamp;
	locale.value = data.client_locale ?? 'en-US';
	receiverState.value = 'AUTHED';
	scheduleRefresh();
}

function clear(): void {
	if (refreshTimer !== null) {
		window.clearTimeout(refreshTimer);
		refreshTimer = null;
	}
	accessToken.value = null;
	refreshToken.value = null;
	userId.value = null;
	serverId.value = null;
	serverUrl.value = null;
	deviceId.value = null;
	castSessionId.value = null;
	launchTimestamp.value = null;
	receiverState.value = 'TEARDOWN';
}

export const authStore = {
	accessToken,
	refreshToken,
	userId,
	serverId,
	serverUrl,
	deviceId,
	castSessionId,
	launchTimestamp,
	locale,
	receiverState,
	ready,
	expiresAtMs,
	userClaims,
	consumeLaunchAuth,
	clear,
	scheduleRefresh,
	forceRefresh: runRefresh,
};
