<script setup lang="ts">
import { useLibrariesQuery } from '@/queries/useLibrariesQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const { data, isLoading, isFetching, error, refetch } = useLibrariesQuery()
</script>

<template>
  <ServerDrivenView
    restoration-key="libraries"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load libraries"
    empty-message="No libraries yet. Add one from your phone or desktop."
  />
</template>
