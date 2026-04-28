<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePersonQuery } from '@/queries/usePersonQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))

const { data, isLoading, isFetching, error, refetch } = usePersonQuery(id)
</script>

<template>
  <ServerDrivenView
    :restoration-key="`person-${id}`"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load person"
  />
</template>
