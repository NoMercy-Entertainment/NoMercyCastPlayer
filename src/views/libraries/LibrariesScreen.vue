<script setup lang="ts">
import { useLibrariesQuery } from '@/queries/useLibrariesQuery';
import HeroRailsView from '@/views/HeroRailsView.vue';

/* Libraries view — same hero + rails composition as TvHomeScreen. */

const { data, isLoading, error, refetch, isFetching } = useLibrariesQuery();
</script>

<template>
	<HeroRailsView
		restoration-key="libraries-rails"
		:data="data"
		:is-loading="isLoading"
		:is-fetching="isFetching"
		:error="error"
		:refetch="() => refetch()"
		error-context="Couldn't load libraries"
		empty-message="No libraries yet. Add one from your phone or desktop."
	/>
</template>
