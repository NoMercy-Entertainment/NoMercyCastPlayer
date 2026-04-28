<script setup lang="ts">
import { useMusicStartQuery } from '@/queries/useMusicStartQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const { data, isLoading, isFetching, error, refetch } = useMusicStartQuery()
</script>

<template>
  <ServerDrivenView
    restoration-key="music-start"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load music"
    empty-message="No music yet. Add a music library to get started."
  />
</template>
