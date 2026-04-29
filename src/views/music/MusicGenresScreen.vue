<script setup lang="ts">
import { useRoute } from 'vue-router';

/*
 * APK MusicGenreScreen.kt is currently a placeholder rendering
 * "MusicGenreScreen: $type / $id" over the setup backdrop. We mirror
 * that until the APK lands real content.
 */
const route = useRoute();
</script>

<template>
	<div class="music-genres">
		<p>MusicGenreScreen: {{ route.fullPath }}</p>
	</div>
</template>

<style scoped>
.music-genres {
	position: relative;
	width: 100%;
	height: 100%;
	display: grid;
	place-items: center;
	color: #fff;
	font-size: 18px;
}
</style>
