<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { framework } from "chromecast-caf-receiver/index";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

import nmplayer from "@nomercy-entertainment/nomercy-video-player/src";
import type { NMPlayer, PlayerConfig, PlaylistItem } from "@nomercy-entertainment/nomercy-video-player/src/types";

import KeyHandlerPlugin from "@nomercy-entertainment/nomercy-video-player/dist/plugins/keyHandlerPlugin";
import { TVUIPlugin } from "@/lib/VideoPlayer/plugins/UIPlugin/tvUIPlugin";
import OctopusPlugin from "@nomercy-entertainment/nomercy-video-player/dist/plugins/octopusPlugin";
import { AutoSkipPlugin } from "@/lib/VideoPlayer/plugins/autoSkipPlugin";
import { SyncPlugin } from "@/lib/VideoPlayer/plugins/syncPlugin";
import CastSyncPlugin from "@/lib/VideoPlayer/plugins/castSyncPlugin";

const player = ref<NMPlayer>();
const show = ref(false);

interface CustomData {
  accessToken: string;
  basePath: string;
  playlist: Array<PlaylistItem>;
  type: string;
  videoId: string;
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

// onMounted(() => {
//   const NAMESPACE = 'urn:x-cast:tv.nomercy.app';
//   const ctx = cast.framework.CastReceiverContext.getInstance();

//   if (!window.playerManager || !window.playerManager.setMessageInterceptor) {
//     console.warn('playerManager or interceptor not available');
//     return;
//   }

//   window.playerManager.setMessageInterceptor(
//     'LOAD',
//     (event: framework.events.Event & { media?: { customData?: CustomData | string }; data?: any }) => {
//       console.log("LOAD interceptor triggered", event);

//       let customData = event?.media?.customData;
//       if (customData && typeof customData === 'string') {
//         try {
//           customData = JSON.parse(customData);
//         } catch (e) {
//           console.warn('Failed to parse customData string', e);
//         }
//       }

//       if (!customData) {
//         console.log('No custom data, using default player');
//         return event; // Let Cast handle normally
//       }

//       try {
//         const videoId = (customData as CustomData).videoId;
//         const type = (customData as CustomData).type || 'movie';
//         let deepLink = `tv.nomercy.app://${type}/${videoId}/watch`;

//         if (!videoId) {
//           deepLink = (customData as CustomData).deepLink
//         }


//         console.log("Opening native app with deep link:", deepLink);

//         // Notify all connected senders (optional) that we're attempting to open the native app.
//         try {
//           ctx.sendCustomMessage(NAMESPACE, undefined, {
//             type: 'LAUNCH_NATIVE_APP',
//             deepLink,
//             videoId,
//             videoType: type
//           });
//         } catch (err) {
//           console.warn('Failed to send LAUNCH_NATIVE_APP message', err);
//         }
//         // 
//         // Attempt to open the native Android TV app. Try multiple strategies:
//         // 1) Standard deep link (tv.nomercy.app://...)
//         // 2) Android intent: some WebViews / Cast receiver environments respond better to intent URIs
//         // 3) As a last resort, create an iframe (older trick). We try 1 then 2 quickly.
//         try {
//           // Primary deep link
//           window.location.href = deepLink;

//           // Also attempt an intent: sometimes required to trigger Play Store or package launch on Android.
//           const intentUrl = `intent://${type}/${videoId}/watch#Intent;scheme=tv.nomercy.app;package=tv.nomercy.app;end`;
//           // Try intent shortly after (non-blocking)
//           setTimeout(() => {
//             try { window.location.href = intentUrl; } catch (_) { /* ignore */ }
//           }, 300);
//         } catch (err) {
//           // If direct navigation is blocked, try iframe fallback
//           try {
//             const iframe = document.createElement('iframe');
//             iframe.style.display = 'none';
//             iframe.src = deepLink;
//             document.body.appendChild(iframe);
//             setTimeout(() => document.body.removeChild(iframe), 1000);
//           } catch (_) { /* ignore */ }
//         }

//         // If the native app doesn't open within 2s, fall back to the receiver's player UI.
//         setTimeout(() => {
//           setupPlayer(customData as CustomData);
//         }, 2000);

//         // Prevent Cast framework from loading its own media player for this LOAD event
//         return null;
//       } catch (err) {
//         console.warn('LOAD interceptor failed', err);
//         setupPlayer(customData);
//         return event;
//       }
//     }
//   );
// });

// onMounted(() => {
//   const NAMESPACE = 'urn:x-cast:tv.nomercy.app.intent';
//   const ctx = cast.framework.CastReceiverContext.getInstance();
//
//   if (!window.playerManager || !window.playerManager.setMessageInterceptor) {
//     console.warn('playerManager or interceptor not available');
//     return;
//   }
//
//   window.playerManager.setMessageInterceptor(
//       'LOAD',
//       (event: framework.events.Event & { media?: { customData?: CustomData }; data?: any }) => {
//         console.log("LOAD interceptor triggered", event);
//
//         const customData = event.media?.customData;
//
//         if (!customData?.deepLink && !customData?.intent) {
//           return event; // Standard video playback
//         }
//
//         const deepLink = customData.deepLink || customData.intent;
//
//         // Send message to all connected senders (phone/web apps)
//         ctx.sendCustomMessage(
//             NAMESPACE,
//             undefined, // senderId - undefined means all senders
//             {
//               type: 'LAUNCH_NATIVE_APP',
//               deepLink: deepLink,
//               videoId: customData.videoId
//             }
//         );
//
//         // Fallback: play in web receiver if native doesn't respond
//         setTimeout(() => {
//           setupPlayer(customData);
//         }, 2000);
//
//         return null; // Prevent default CAF handling initially
//       }
//   );
// });

onMounted(() => {
  if (!window.playerManager || !window.playerManager.setMessageInterceptor) {
    console.warn('playerManager or interceptor not available');
    return;
  }

  window.playerManager.setMessageInterceptor(
      'LOAD',
      loadRequestData => {
        show.value = true;
        // Haal het token uit de customData die je vanuit Kotlin meestuurt
        const token = loadRequestData.media.customData.bearerToken;

        window.playerManager.getPlaybackConfig().manifestRequestHandler = requestInfo => {
          requestInfo.withCredentials = true;
          requestInfo.headers = requestInfo.headers || {};
          requestInfo.headers['Authorization'] = 'Bearer ' + token;
        };

        window.playerManager.getPlaybackConfig().segmentRequestHandler = requestInfo => {
          requestInfo.withCredentials = true;
          requestInfo.headers = requestInfo.headers || {};
          requestInfo.headers['Authorization'] = 'Bearer ' + token;
        };

        return loadRequestData;
    }
  );
});

// onUnmounted(() => {
//   player.value?.dispose();
// });

</script>

<template>
  <!-- <div class="absolute inset-0 flex h-full w-full overflow-clip bg-black z-1199" :class="{
    'opacity-0': !show,
    'opacity-100': show
  }">
    <div id="player1" class="group nomercyplayer"></div>
  </div> -->
  <cast-media-player :class="{
    'opacity-0': !show,
    'opacity-100': show
  }"></cast-media-player>

  <div v-if="!show"
    class="w-full h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#232323] to-[#161616] px-[100px] py-[45px]">

    <img class="w-full h-auto absolute inset-0 aspect-video" :src="splash" alt="NoMercy Entertainment Logo" />

    <div class="relative flex flex-col justify-start items-start w-[625px] gap-4">

      <p
        class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[40px] font-black text-left text-[#ededed] leading-none">
        Ready to cast
      </p>

      <p class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
          To start casting audio or video tap the
        </span>
        <br />
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] font-bold text-left text-[#ededed]">
          Chromecast
        </span>
        <span class="self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[20px] text-left text-[#ededed]">
          button in the MediaPlayer or App
        </span>
      </p>
    </div>

    <img class="relative w-[208px] h-[232px]" :src="mobile" alt="NoMercy Entertainment Logo" />

    <img class="flex-grow-0 flex-shrink-0 w-min h-10 relative" :src="logo" alt="NoMercy Entertainment Logo" />
  </div>
</template>

<style scoped></style>