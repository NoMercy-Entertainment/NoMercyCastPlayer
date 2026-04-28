import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';
import { QueryKeys } from './keys';
import { queryConfigs } from './configs';
import { apiFetch } from '@/lib/http/client';
import type { Component } from '@/server-components/types';

async function fetchSearch(type: string, query: string): Promise<Component[]> {
	if (!query.trim())
		return [];
	const url = `/api/v1/search/${type}?q=${encodeURIComponent(query)}`;
	const response = await apiFetch<{ components?: Component[] } | Component[]>({
		path: url,
		method: 'GET',
	});
	if (Array.isArray(response))
		return response;
	return response.components ?? [];
}

export function useSearchQuery(type: Ref<string>, queryStr: Ref<string>) {
	const queryKey = computed(() => [...QueryKeys.search(type.value, queryStr.value)]);

	return useQuery({
		queryKey,
		queryFn: () => fetchSearch(type.value, queryStr.value),
		enabled: computed(() => queryStr.value.trim().length > 0),
		...queryConfigs.realtime,
	});
}
