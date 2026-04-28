<script setup lang="ts">
import Backdrop from './Backdrop.vue';
import TopNavBar from './TopNavBar.vue';

/**
 * Outermost shell — backdrop, topnav, RouterView with KeepAlive cache.
 *
 * KeepAlive :max="6" caches the last 6 page components so back-navigation
 * restores instantly. onActivated triggers focus restoration via the
 * focusStore mechanism in nested useFocusGroup composables.
 */
</script>

<template>
	<div class="app-shell">
		<Backdrop />
		<TopNavBar />
		<main class="page">
			<RouterView v-slot="{ Component }">
				<KeepAlive :max="6">
					<component :is="Component" />
				</KeepAlive>
			</RouterView>
		</main>
	</div>
</template>

<style scoped>
.app-shell {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}
.page {
	position: relative;
	z-index: 1;
	flex: 1;
	overflow: hidden;
}
</style>
