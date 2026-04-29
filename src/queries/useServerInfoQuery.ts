import { useQuery } from '@tanstack/vue-query';
import { apiFetch } from '@/lib/http/client';

/**
 * Server info query — mirrors APK useServerInfoQuery hitting
 * /api/v1/setup/server-info. Used by ServerInfoScreen to surface
 * the running server's OS / arch / version / uptime / hardware.
 */

export interface ServerInfo {
	server: string;
	cpu: string[];
	gpu: string[];
	os: string;
	arch: string;
	version: string;
	bootTime: string;
	osVersion?: string | null;
}

interface ApiEnvelope {
	data?: ServerInfo;
}

async function fetchServerInfo(): Promise<ServerInfo | null> {
	const response = await apiFetch<ApiEnvelope | ServerInfo>({
		path: '/api/v1/setup/server-info',
		method: 'GET',
	});
	if (response && typeof response === 'object' && 'data' in response && response.data)
		return response.data;
	return (response as ServerInfo) ?? null;
}

export function useServerInfoQuery() {
	return useQuery({
		queryKey: ['server-info'],
		queryFn: fetchServerInfo,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}
