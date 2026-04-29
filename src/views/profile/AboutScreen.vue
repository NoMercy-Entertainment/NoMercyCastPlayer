<script setup lang="ts">
/*
 * About screen — mirrors APK AboutScreen.kt: app branding card +
 * version info + open-source notice. Cast receiver doesn't ship a
 * runtime version string yet, so we render a placeholder.
 */
</script>

<template>
	<div class="about-screen">
		<header class="page-header">
			<h1>About</h1>
		</header>

		<div class="card">
			<div class="logo">
				NM
			</div>
			<div>
				<p class="brand">
					NoMercy Cast Receiver
				</p>
				<p class="tagline">
					Your media, your way.
				</p>
				<p class="version">
					Version 1.0.0-alpha
				</p>
			</div>
		</div>

		<p class="legal">
			© NoMercy Entertainment. All product names, logos, and brands are
			property of their respective owners.
		</p>
	</div>
</template>

<style scoped>
.about-screen {
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none;
	padding: 32px;
}
.about-screen::-webkit-scrollbar {
	display: none;
}
.page-header {
	max-width: 920px;
	margin: 0 auto 16px;
}
.page-header h1 {
	margin: 0;
	font-size: 24px;
	font-weight: 700;
}
.card {
	max-width: 920px;
	margin: 0 auto 24px;
	padding: 24px;
	background: oklch(0.18 0.01 250 / 0.85);
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 16px;
	display: flex;
	gap: 24px;
	align-items: center;
}
.logo {
	width: 80px;
	height: 80px;
	border-radius: 18px;
	background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
	color: #fff;
	font-size: 28px;
	font-weight: 800;
	display: grid;
	place-items: center;
	flex: 0 0 auto;
}
.brand {
	margin: 0;
	font-size: 22px;
	font-weight: 700;
	color: #fff;
}
.tagline {
	margin: 4px 0 0;
	font-size: 14px;
	color: oklch(0.85 0.005 250);
}
.version {
	margin: 16px 0 0;
	font-size: 12px;
	color: oklch(0.65 0.005 250);
	font-variant-numeric: tabular-nums;
}
.legal {
	max-width: 920px;
	margin: 0 auto;
	font-size: 12px;
	color: oklch(0.6 0.005 250);
	line-height: 1.5;
}
</style>
