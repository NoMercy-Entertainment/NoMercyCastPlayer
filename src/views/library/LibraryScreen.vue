<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryQuery } from '@/queries/useLibraryQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const route = useRoute()

const path = computed(() => {
  const matched = route.params.pathMatch
  if (Array.isArray(matched)) return matched.join('/')
  return matched ?? ''
})

const { data, isLoading, isFetching, error, refetch } = useLibraryQuery(path)
</script>

<template>
  <ServerDrivenView
    :restoration-key="`library-${path}`"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load this library"
    empty-message="This library is empty."
  />
</template>
