<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicListQuery } from '@/queries/useMusicListQuery'
import ServerDrivenView from '../ServerDrivenView.vue'

const route = useRoute()
const type = computed(() => String(route.params.type ?? ''))
const id = computed(() => String(route.params.id ?? ''))

const { data, isLoading, isFetching, error, refetch } = useMusicListQuery(type, id)
</script>

<template>
  <ServerDrivenView
    :restoration-key="`music-list-${type}-${id}`"
    :data="data"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :error="error"
    :refetch="() => refetch()"
    error-context="Couldn't load this list"
    empty-message="This list is empty."
  />
</template>
