import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';
import { QueryKeys } from './keys';
import { queryConfigs } from './configs';
import { apiFetch } from '@/lib/http/client';

export interface PlaylistItem {
	id: number | string;
	title: string;
	duration?: string | number;
	videoId?: string;
	resume_at?: number;
	// Full shape comes from server; receiver reads only fields it uses.
	[k: string]: unknown;
}

export interface PlaylistResponse {
	item: PlaylistItem;
	playlist: PlaylistItem[];
}

async function fetchPlaylist(type: string, id: string): Promise<PlaylistResponse> {
	return apiFetch<PlaylistResponse>({
		path: `/api/v1/${type}/${id}/watch`,
		method: 'GET',
	});
}

export function usePlaylistQuery(type: Ref<string>, id: Ref<string>) {
	const queryKey = computed(() => [...QueryKeys.playlist(type.value, id.value)]);

	return useQuery({
		queryKey,
		queryFn: () => fetchPlaylist(type.value, id.value),
		...queryConfigs.standard,
	});
}
