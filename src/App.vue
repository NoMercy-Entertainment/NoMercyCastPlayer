<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import type {framework} from "chromecast-caf-receiver/index";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

import nmplayer from "@nomercy-entertainment/nomercy-video-player/src";
import type {NMPlayer, PlayerConfig, PlaylistItem} from "@nomercy-entertainment/nomercy-video-player/src/types";

import KeyHandlerPlugin from "@nomercy-entertainment/nomercy-video-player/dist/plugins/keyHandlerPlugin";
import {TVUIPlugin} from "@/lib/VideoPlayer/plugins/UIPlugin/tvUIPlugin";
import OctopusPlugin from "@nomercy-entertainment/nomercy-video-player/dist/plugins/octopusPlugin";
import AutoSkipPlugin from "@/lib/VideoPlayer/plugins/autoSkipPlugin";
import SyncPlugin from "@/lib/VideoPlayer/plugins/syncPlugin";
import CastSyncPlugin from "@/lib/VideoPlayer/plugins/castSyncPlugin";

const player = ref<NMPlayer>();
const show = ref(false);

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

        show.value = true;

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
  <div class="absolute inset-0 flex h-full w-full overflow-clip bg-black z-1199"
       :class="{
        'opacity-0': !show,
        'opacity-100': show
      }"
  >
    <div id="player1" class="group nomercyplayer"></div>
  </div>

  <div v-if="!show" class="w-[1920px] h-[1080px] flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#232323] to-[#161616] px-[200px] py-[95px]">

    <img class="w-full h-auto absolute inset-0 aspect-video"
         :src="splash"
         alt="NoMercy Entertainment Logo"/>

    <div class="relative flex flex-col justify-start items-start w-[1251px] gap-8">

      <p class="self-stretch flex-grow-0 flex-shrink-0 w-[1251px] text-[80px] font-black text-left text-[#ededed] leading-none">
        Ready to cast
      </p>

      <p class="self-stretch flex-grow-0 flex-shrink-0 w-[1251px] text-[40px] text-left text-[#ededed]">
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[1251px] text-[40px] text-left text-[#ededed]">
          To start casting audio or video tap the
        </span>
        <br/>
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[1251px] text-[40px] font-bold text-left text-[#ededed]">
          Chromecast
        </span>
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[1251px] text-[40px] text-left text-[#ededed]">
        button in the MediaPlayer or App
        </span>
      </p>
    </div>

    <img class="relative w-[416px] h-[464px]"
         :src="mobile"
         alt="NoMercy Entertainment Logo"/>

      <img class="flex-grow-0 flex-shrink-0 w-min h-20 relative"
           :src="logo"
           alt="NoMercy Entertainment Logo"/>
  </div>
</template>

<style scoped>
</style>