import { nomercyApiBase } from '@/lib/nomercyApi';

/**
 * Resolves the media server this account talks to, the same call the KMP
 * receiver makes (`fetchAppConfig`, `GET {domain}/v1/app_config`) — kept as
 * its own module so it can be called from the custom-message handshake
 * before authStore has anything else populated.
 *
 * No server-selection UI exists on this receiver yet (matches the KMP
 * receiver's own documented gap) — always the account's first server.
 */

interface AppConfigServer {
	id: string;
	serverApiUrl: string;
}

interface AppConfigResponse {
	data?: {
		servers?: AppConfigServer[];
	};
}

export interface ResolvedServer {
	serverId: string;
	serverUrl: string;
}

export async function resolveServerFromAppConfig(accessToken: string): Promise<ResolvedServer | null> {
	const base = nomercyApiBase(accessToken);
	const res = await fetch(`${base}/v1/app_config`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
	});
	if (!res.ok) {
		console.warn('[app_config] non-OK response', res.status, base);
		return null;
	}
	const body = (await res.json()) as AppConfigResponse;
	const server = body.data?.servers?.[0];
	if (!server)
		return null;
	return { serverId: server.id, serverUrl: server.serverApiUrl };
}
