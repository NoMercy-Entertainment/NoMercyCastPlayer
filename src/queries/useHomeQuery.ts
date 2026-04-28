import { useQuery } from '@tanstack/vue-query';
import { QueryKeys } from './keys';
import { queryConfigs } from './configs';
import { usePageLoadMutationEffect } from './usePageLoadMutationEffect';
import { apiFetch } from '@/lib/http/client';
import type { Component } from '@/server-components/types';

export interface HomeResponse {
	components: Component[];
}

async function fetchHome(): Promise<Component[]> {
	const response = await apiFetch<HomeResponse | Component[]>({
		path: '/api/v1/home',
		method: 'GET',
	});
	if (Array.isArray(response))
		return response;
	if (response && 'components' in response)
		return response.components;
	return [];
}

export function useHomeQuery() {
	const query = useQuery({
		queryKey: [...QueryKeys.home()],
		queryFn: fetchHome,
		...queryConfigs.standard,
	});

	usePageLoadMutationEffect(
		[...QueryKeys.home()],
		query.data,
		query.isLoading,
		query.isFetching,
	);

	return query;
}
