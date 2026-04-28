import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys } from './keys'
import { queryConfigs } from './configs'
import { usePageLoadMutationEffect } from './usePageLoadMutationEffect'
import { apiFetch } from '@/lib/http/client'
import type { Component } from '@/server-components/types'

async function fetchInfo(type: string, id: string): Promise<Component[]> {
  const response = await apiFetch<{ components?: Component[] } | Component[]>({
    path: `/api/v1/info/${type}/${id}`,
    method: 'GET',
  })
  if (Array.isArray(response)) return response
  return response.components ?? []
}

export function useInfoQuery(type: Ref<string>, id: Ref<string>) {
  const queryKey = computed(() => [...QueryKeys.info(type.value, id.value)])

  const query = useQuery({
    queryKey,
    queryFn: () => fetchInfo(type.value, id.value),
    ...queryConfigs.standard,
  })

  usePageLoadMutationEffect(queryKey.value, query.data, query.isLoading, query.isFetching)

  return query
}
