import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';
import { QueryKeys } from './keys';
import { queryConfigs } from './configs';
import { usePageLoadMutationEffect } from './usePageLoadMutationEffect';
import { apiFetch } from '@/lib/http/client';
import type { Component } from '@/server-components/types';

interface LibraryResponse {
	components?: Component[];
}

const LEADING_SLASH = /^\//;

async function fetchLibrary(path: string): Promise<Component[]> {
	const response = await apiFetch<LibraryResponse | Component[]>({
		path: `/api/v1/library/${path.replace(LEADING_SLASH, '')}`,
		method: 'GET',
	});
	if (Array.isArray(response))
		return response;
	return response.components ?? [];
}

export function useLibraryQuery(path: Ref<string>) {
	const queryKey = computed(() => [...QueryKeys.library(path.value)]);

	const query = useQuery({
		queryKey,
		queryFn: () => fetchLibrary(path.value),
		...queryConfigs.standard,
	});

	usePageLoadMutationEffect(queryKey.value, query.data, query.isLoading, query.isFetching);

	return query;
}
