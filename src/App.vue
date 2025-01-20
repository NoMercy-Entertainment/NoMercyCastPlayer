<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";

import nmplayer from "@nomercy-entertainment/nomercy-video-player/src";
import type {NMPlayer, PlayerConfig, PlaylistItem} from "@nomercy-entertainment/nomercy-video-player/src/types";

import {KeyHandlerPlugin} from "@nomercy-entertainment/nomercy-video-player/dist/plugins/keyHandlerPlugin";
import {DesktopUIPlugin} from "@/lib/VideoPlayer/plugins/UIPlugin/desktopUIPlugin";
import {OctopusPlugin} from "@nomercy-entertainment/nomercy-video-player/dist/plugins/octopusPlugin";
import {AutoSkipPlugin} from "@/lib/VideoPlayer/plugins/autoSkipPlugin";
import {SyncPlugin} from "@/lib/VideoPlayer/plugins/syncPlugin";
import {LoadEvent} from "chromecast-caf-receiver/cast.framework.events";
import initializeSocket from "@/lib/socketClient/initializeSocket";

const player = ref<NMPlayer>();

onMounted(() => {

  const context = window.cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  /*
   * Set the player configuration.
   */
  const playbackConfig = new window.cast.framework.PlaybackConfig();
  playbackConfig.autoResumeDuration = 5;

  /*
   * Configure the CastReceiverOptions.
   */
  const castReceiverOptions = new window.cast.framework.CastReceiverOptions();
  castReceiverOptions.playbackConfig = playbackConfig;
  castReceiverOptions.skipPlayersLoad = true;
  castReceiverOptions.disableIdleTimeout = true;
  castReceiverOptions.supportedCommands = window.cast.framework.messages.Command.ALL_BASIC_MEDIA;

  context.start(castReceiverOptions);

  playerManager.setMessageInterceptor(
      window.cast.framework.messages.MessageType.LOAD,
      async (event: LoadEvent & {
        media: {
          customData: {
            accessToken: string;
            basePath: string;
            playlist: Array<PlaylistItem>;
          };
        };
      }) => {
        
        await initializeSocket(event.media!.customData.basePath, event.media!.customData.accessToken);

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
          ...event.media!.customData
        };

        player.value = nmplayer('player1')
            .setup(config) as unknown as NMPlayer;

        const keyHandlerPlugin = new KeyHandlerPlugin();
        player.value.registerPlugin("keyHandler", keyHandlerPlugin);
        player.value.usePlugin("keyHandler");

        const desktopUIPlugin = new DesktopUIPlugin();
        player.value?.registerPlugin('desktopUI', desktopUIPlugin);
        player.value?.usePlugin('desktopUI');

        const octopusPlugin = new OctopusPlugin();
        player.value?.registerPlugin('octopus', octopusPlugin);
        player.value?.usePlugin('octopus');

        const autoSkipPlugin = new AutoSkipPlugin();
        player.value?.registerPlugin('autoSkip', autoSkipPlugin);
        player.value?.usePlugin('autoSkip');

        const syncPlugin = new SyncPlugin();
        player.value?.registerPlugin('sync', syncPlugin);
        player.value?.usePlugin('sync');

        player.value.on("ready", () => {
          player.value!.play();
        });
      }
  );
});

onUnmounted(() => {
  player.value?.dispose();
});

</script>

<template>
  <div id="player1" class="group nomercyplayer rounded-md !overflow-unset"></div>
</template>

<style scoped>
</style>