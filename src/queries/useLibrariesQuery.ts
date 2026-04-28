import { useQuery } from '@tanstack/vue-query';
import { QueryKeys } from './keys';
import { queryConfigs } from './configs';
import { usePageLoadMutationEffect } from './usePageLoadMutationEffect';
import { apiFetch } from '@/lib/http/client';
import type { Component } from '@/server-components/types';

interface LibrariesResponse {
	components?: Component[];
}

async function fetchLibraries(): Promise<Component[]> {
	const response = await apiFetch<LibrariesResponse | Component[]>({
		path: '/api/v1/libraries',
		method: 'GET',
	});
	if (Array.isArray(response))
		return response;
	return response.components ?? [];
}

export function useLibrariesQuery() {
	const query = useQuery({
		queryKey: [...QueryKeys.libraries()],
		queryFn: fetchLibraries,
		...queryConfigs.standard,
	});

	usePageLoadMutationEffect(
		[...QueryKeys.libraries()],
		query.data,
		query.isLoading,
		query.isFetching,
	);

	return query;
}
