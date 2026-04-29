<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/*
 * Person view — APK PersonScreen.kt is currently a placeholder rendering
 * "PersonScreen: id=$id" over the setup backdrop. We mirror that until
 * the APK lands real content, at which point we port it here.
 */
const route = useRoute();
const id = computed(() => String(route.params.id ?? ''));
</script>

<template>
	<div class="person">
		<p>PersonScreen: id={{ id }}</p>
	</div>
</template>

<style scoped>
.person {
	position: relative;
	width: 100%;
	height: 100%;
	display: grid;
	place-items: center;
	color: #fff;
	font-size: 18px;
}
</style>
