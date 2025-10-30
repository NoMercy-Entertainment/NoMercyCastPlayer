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

interface CustomData {
  accessToken: string;
  basePath: string;
  playlist: Array<PlaylistItem>;
  deepLink: string;
  intent: string;
}

  function setupPlayer(customData: CustomData) {

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
    ...customData,
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

onMounted(() => {
  const NAMESPACE = 'urn:x-cast:tv.nomercy.app.intent';
  const ctx = cast.framework.CastReceiverContext.getInstance();

  if (!window.playerManager || !window.playerManager.setMessageInterceptor) {
    console.warn('playerManager or interceptor not available');
    return;
  }

  window.playerManager.setMessageInterceptor(
      'LOAD',
      (event: framework.events.Event & { media?: { customData?: string }; data?: any }) => {
        console.log("LOAD interceptor triggered", event);

        const newCustomData: CustomData = JSON.parse(event.media?.customData || '{}');

        try {
          // Extract payload safely
          let payload: string | null = null;
          if (event?.media?.customData) {
            console.log("Custom data found:", newCustomData);
            payload = (newCustomData.deepLink as string) || (newCustomData.intent as string);
          } else if (typeof event === 'string') {
            console.log("Event is a string:", event);
            payload = event;
          } else if (event && typeof event.data === 'string') {
            console.log("Event data found:", event.data);
            payload = event.data;
          }

          if (!payload || typeof payload !== 'string') {
            console.log('No valid deep-link payload found');
            return event; // not our deep-link payload
          }

          // Normalize deep link like "tv.nomercy.app://open?route=/player&mediaId=abc"
          const stripped = payload.replace(/^.*?:\/\//, '');
          // Only encode the path/query portion — do not double-encode the whole intent
          const intentUrl = `intent://${stripped}#Intent;scheme=tv.nomercy.app;package=tv.nomercy.app;end`;

          // Send an optional broadcast ack
          try {
            if (ctx && (ctx as any).sendCustomMessage) {
              // second param senderId=null to broadcast
              (ctx as any).sendCustomMessage(NAMESPACE, null, JSON.stringify({type: 'intent_received', payload}));
            }
          } catch (e) {
            /* ignore ack errors */
          }

          // Attempt to open native app
          window.location.href = intentUrl;

          // Fallback: load player in receiver if native app doesn't open
          setTimeout(() => {
            if (event?.media?.customData) setupPlayer(newCustomData);
          }, 1000);

          // prevent CAF from doing its default LOAD handling
          return null;
        } catch (err) {
          console.warn('LOAD interceptor failed', err);
          return event;
        }
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

  <div v-if="!show" class="w-full h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#232323] to-[#161616] px-[100px] py-[45px]">

    <img class="w-full h-auto absolute inset-0 aspect-video"
         :src="splash"
         alt="NoMercy Entertainment Logo"/>

    <div class="relative flex flex-col justify-start items-start w-[625px] gap-4">

      <p class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[40px] font-black text-left text-[#ededed] leading-none">
        Ready to cast
      </p>

      <p class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
          To start casting audio or video tap the
        </span>
        <br/>
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] font-bold text-left text-[#ededed]">
          Chromecast
        </span>
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
        button in the MediaPlayer or App
        </span>
      </p>
    </div>

    <img class="relative w-[208px] h-[232px]"
         :src="mobile"
         alt="NoMercy Entertainment Logo"/>

      <img class="flex-grow-0 flex-shrink-0 w-min h-10 relative"
           :src="logo"
           alt="NoMercy Entertainment Logo"/>
  </div>
</template>

<style scoped>
</style>