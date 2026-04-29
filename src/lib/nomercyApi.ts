/**
 * NoMercy SaaS API base URL helper. The cast receiver hits two
 * different APIs:
 *   - Per-server: authStore.serverUrl (the user's own media server) —
 *     used by lib/http/client for content endpoints.
 *   - Cross-server: NoMercy SaaS — used for /v1/me, server registration,
 *     and certificate issuance.
 *
 * Derive the SaaS base from VITE_DEFAULT_API_BASE_URL when set, or
 * from the auth URL by swapping `auth.` → `api.` (covers both
 * auth.nomercy.tv → api.nomercy.tv and auth-dev → api-dev).
 */

const AUTH_BASE
	= import.meta.env.VITE_DEFAULT_AUTH_BASE_URL ?? 'https://auth.nomercy.tv/realms/NoMercyTV';

const AUTH_HOSTNAME_PREFIX = /^auth/;

function deriveFromAuth(): string {
	try {
		const u = new URL(AUTH_BASE);
		return `${u.protocol}//${u.hostname.replace(AUTH_HOSTNAME_PREFIX, 'api')}`;
	}
	catch {
		return 'https://api.nomercy.tv';
	}
}

export const NOMERCY_API_BASE
	= import.meta.env.VITE_DEFAULT_API_BASE_URL ?? deriveFromAuth();

export interface SaasUser {
	id: string;
	name: string;
	email: string;
	currentServer: string | null;
	locale: string;
	avatarUrl: string;
	admin: boolean;
	moderator: boolean;
	messages?: unknown[];
	notifications?: unknown[];
	features?: Record<string, boolean>;
}

interface SaasResponse<T> {
	status: string;
	data: T;
}

export async function fetchSaasUser(accessToken: string): Promise<SaasUser | null> {
	if (!accessToken)
		return null;
	const res = await fetch(`${NOMERCY_API_BASE}/v1/me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
	});
	if (!res.ok)
		return null;
	const body = (await res.json()) as SaasResponse<SaasUser>;
	if (body.status !== 'ok')
		return null;
	return body.data;
}
