<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePlaylistQuery } from '@/queries/usePlaylistQuery';
import VideoPlayer from '@/players/video/VideoPlayer.vue';
import Skeleton from '@/components/feedback/Skeleton.vue';
import ErrorPanel from '@/components/feedback/ErrorPanel.vue';

const props = defineProps<{
	type?: string;
	id?: string;
}>();

const route = useRoute();
const type = computed(
	() => (props.type ?? String(route.params.type ?? '')) as 'movie' | 'tv',
);
const id = computed(() => props.id ?? String(route.params.id ?? ''));
const resumeAt = computed(() => {
	const q = route.query.resume_at;
	if (Array.isArray(q))
		return Number(q[0]) || undefined;
	if (typeof q === 'string')
		return Number(q) || undefined;
	return undefined;
});

const { data, isLoading, error, refetch } = usePlaylistQuery(type, id);

const playlist = computed(() => data.value?.playlist ?? []);
const initialItem = computed(() => data.value?.item);
</script>

<template>
	<div class="watch">
		<ErrorPanel
			v-if="error"
			:error="error as Error"
			:retry="() => refetch()"
			context="Couldn't load video"
		/>
		<Skeleton v-else-if="isLoading" type="hero" :count="1" />
		<VideoPlayer
			v-else-if="initialItem"
			:id="id"
			:type="type"
			:resume-at="resumeAt"
			:playlist="playlist"
			:initial-item="initialItem"
		/>
	</div>
</template>

<style scoped>
.watch {
	position: fixed;
	inset: 0;
	background: black;
	z-index: 100;
}
</style>
