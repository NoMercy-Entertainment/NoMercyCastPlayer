import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys } from './keys'
import { queryConfigs } from './configs'
import { usePageLoadMutationEffect } from './usePageLoadMutationEffect'
import { apiFetch } from '@/lib/http/client'
import type { Component } from '@/server-components/types'

async function fetchMusicCards(path: string): Promise<Component[]> {
  const response = await apiFetch<{ components?: Component[] } | Component[]>({
    path: `/api/v1/music/${path.replace(/^\//, '')}`,
    method: 'GET',
  })
  if (Array.isArray(response)) return response
  return response.components ?? []
}

export function useMusicCardQuery(path: Ref<string>) {
  const queryKey = computed(() => [...QueryKeys.musicCards(path.value)])

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMusicCards(path.value),
    ...queryConfigs.standard,
  })

  usePageLoadMutationEffect(queryKey.value, query.data, query.isLoading, query.isFetching)

  return query
}
