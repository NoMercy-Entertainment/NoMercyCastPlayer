<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import type {framework} from "chromecast-caf-receiver/index";

import nmplayer from "@nomercy-entertainment/nomercy-video-player/src";
import type {NMPlayer, PlayerConfig, PlaylistItem} from "@nomercy-entertainment/nomercy-video-player/src/types";

import {KeyHandlerPlugin} from "@nomercy-entertainment/nomercy-video-player/dist/plugins/keyHandlerPlugin";
import {TVUIPlugin} from "@/lib/VideoPlayer/plugins/UIPlugin/tvUIPlugin";
import {OctopusPlugin} from "@nomercy-entertainment/nomercy-video-player/dist/plugins/octopusPlugin";
import {AutoSkipPlugin} from "@/lib/VideoPlayer/plugins/autoSkipPlugin";
import {SyncPlugin} from "@/lib/VideoPlayer/plugins/syncPlugin";
import {CastSyncPlugin} from "@/lib/VideoPlayer/plugins/castSyncPlugin";

const player = ref<NMPlayer>();

onMounted(() => {

    window.playerManager.setMessageInterceptor(
        "LOAD",
        (event: framework.events.Event & {
            media: {
                customData: {
                    accessToken: string;
                    basePath: string;
                    playlist: Array<PlaylistItem>;
                };
            };
        }) => {

            player.value?.dispose();

            const config: PlayerConfig = {
                muted: false,
                controls: false,
                preload: "auto",
                debug: false,
                autoPlay: true,
                controlsTimeout: 3000,
                doubleClickDelay: 500,
                playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                renderAhead: 100,
                forceTvMode: true,
                disableTouchControls: false,
                disableMediaControls: false,
                ...event.media.customData,
            };

            player.value = nmplayer('player1')
                .setup(config) as unknown as NMPlayer;

            const tvUIPlugin = new TVUIPlugin();
            player.value?.registerPlugin('tvUIPlugin', tvUIPlugin);
            player.value?.usePlugin('tvUIPlugin');

            const octopusPlugin = new OctopusPlugin();
            player.value?.registerPlugin('octopus', octopusPlugin);
            player.value?.usePlugin('octopus');

            const autoSkipPlugin = new AutoSkipPlugin();
            player.value?.registerPlugin('autoSkip', autoSkipPlugin);
            player.value?.usePlugin('autoSkip');

            const keyHandlerPlugin = new KeyHandlerPlugin();
            player.value.registerPlugin("keyHandler", keyHandlerPlugin);
            player.value.usePlugin("keyHandler");

            const syncPlugin = new SyncPlugin();
            player.value?.registerPlugin('sync', syncPlugin);
            player.value?.usePlugin('sync');

            const castSyncPlugin = new CastSyncPlugin();
            player.value?.registerPlugin('castSync', castSyncPlugin);
            player.value?.usePlugin('castSync');

            player.value.on("ready", () => {
                player.value?.play();
            });

            player.value.on("controls", (showing) => {
                if (showing) {
                    setTimeout(() => {
                        document.querySelector<HTMLButtonElement>(".nomercyplayer .playback")?.focus();
                    }, 300);
                }
            });

        }
    );
});

onUnmounted(() => {
    player.value?.dispose();
});

</script>

<template>
    <div class="absolute inset-0 flex h-full w-full overflow-clip bg-black z-1199">
        <div id="player1" class="group nomercyplayer"></div>
    </div>
</template>

<style scoped>
</style>