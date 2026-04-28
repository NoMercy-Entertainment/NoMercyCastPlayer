import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		outDir: 'docs',
		target: 'es2022',
		sourcemap: true,
		rollupOptions: {
			output: {
				// Vite 8 swapped rollup → rolldown; manualChunks is function-only now.
				manualChunks(id: string): string | undefined {
					if (id.includes('node_modules/@microsoft/signalr'))
						return 'cast-sdk';
					if (id.includes('node_modules/@nomercy-entertainment/nomercy-video-player')) {
						return 'video-player';
					}
					if (id.includes('node_modules/hls.js'))
						return 'hls';
					return undefined;
				},
			},
		},
	},
	server: {
		open: true,
		port: 5501,
		allowedHosts: ['vscode.nomercy.tv', 'cast.nomercy.tv'],
	},
});
