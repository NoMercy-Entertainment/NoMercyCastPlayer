<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicCardQuery } from '@/queries/useMusicCardQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const route = useRoute()
const path = computed(() => {
  const matched = route.params.pathMatch
  if (Array.isArray(matched)) return matched.join('/')
  return matched ?? ''
})

const { data, isLoading, isFetching, error, refetch } = useMusicCardQuery(path)
</script>

<template>
  <ServerDrivenView
    :restoration-key="`music-cards-${path}`"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load music cards"
    empty-message="Nothing here."
  />
</template>
