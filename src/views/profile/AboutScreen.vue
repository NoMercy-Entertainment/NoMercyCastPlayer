<script setup lang="ts">
/*
 * About screen — APK preferences/about/tv/AboutScreen.kt parity.
 * Centered product card: logo + app name + version + tagline +
 * developed-by + copyright. No technical details (build flavor,
 * package name, installer ID) — those belong on the dashboard.
 */

const APP_VERSION = '1.0.0-alpha';
const FOUNDING_YEAR = 2024;
const currentYear = new Date().getFullYear();
</script>

<template>
	<div class="about-screen">
		<div class="about-card">
			<div class="logo">
				<span class="logo-mark">NM</span>
			</div>

			<div class="brand-row">
				<h1 class="brand">
					NoMercy
				</h1>
				<p class="version">
					Version {{ APP_VERSION }}
				</p>
			</div>

			<p class="tagline">
				Your media, on every screen. Self-hosted. No ads, no tracking,
				no compromise.
			</p>

			<div class="footer">
				<p class="developed">
					Developed by NoMercy Entertainment
				</p>
				<p class="copyright">
					© {{ FOUNDING_YEAR }}–{{ currentYear }} NoMercy Entertainment.
					All product names, logos, and brands are property of their
					respective owners.
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.about-screen {
	height: 100%;
	display: grid;
	place-items: center;
	padding: 48px;
}
.about-card {
	max-width: 720px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	color: #fff;
	text-align: center;
}
.logo {
	width: 96px;
	height: 96px;
	border-radius: 24px;
	background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
	display: grid;
	place-items: center;
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}
.logo-mark {
	font-size: 36px;
	font-weight: 800;
	color: #fff;
	letter-spacing: -0.04em;
}
.brand-row {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}
.brand {
	margin: 0;
	font-size: 40px;
	font-weight: 800;
	letter-spacing: -0.02em;
}
.version {
	margin: 0;
	font-size: 14px;
	font-weight: 500;
	color: oklch(0.85 0.005 250);
}
.tagline {
	margin: 0;
	font-size: 16px;
	line-height: 1.5;
	color: oklch(0.92 0.005 250);
	max-width: 540px;
}
.footer {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 12px;
}
.developed {
	margin: 0;
	font-size: 13px;
	color: oklch(0.85 0.005 250);
}
.copyright {
	margin: 0;
	font-size: 11px;
	line-height: 1.5;
	color: oklch(0.7 0.005 250);
	max-width: 600px;
}
</style>
