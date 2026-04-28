<script setup lang="ts">
/**
 * Genres landing inside the music section. The server's musicCards
 * query at path 'genres' returns the genre tile grid, so this is a
 * thin wrapper that points there with a fixed restoration key.
 */
import { ref } from 'vue';
import { useMusicCardQuery } from '@/queries/useMusicCardQuery';
import ServerDrivenView from '../ServerDrivenView.vue';

const path = ref('genres');
const { data, isLoading, isFetching, error, refetch } = useMusicCardQuery(path);
</script>

<template>
	<ServerDrivenView
		restoration-key="music-genres"
		:data="data"
		:is-loading="isLoading"
		:is-fetching="isFetching"
		:error="error"
		:refetch="() => refetch()"
		error-context="Couldn't load genres"
		empty-message="No genres yet."
	/>
</template>
