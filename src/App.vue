<script setup lang="ts">
import { onMounted, ref } from "vue";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

const show = ref(false);

onMounted(() => {
  const NAMESPACE = 'urn:x-cast:tv.nomercy.app';
  const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
  const context = cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();
  const LOG_TAG = 'MyReceiverApp';

  /*
   * Set the player configuration.
   */
  const playbackConfig = new cast.framework.PlaybackConfig();
  playbackConfig.autoResumeDuration = 5;

  const controls = cast.framework.ui.Controls.getInstance();
  controls.clearDefaultSlotAssignments();

  // Assign buttons to control slots.
  controls.assignButton(
      cast.framework.ui.ControlsSlot.SLOT_SECONDARY_1,
      cast.framework.ui.ControlsButton.QUEUE_PREV
  );
  controls.assignButton(
      cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
      cast.framework.ui.ControlsButton.CAPTIONS
  );
  controls.assignButton(
      cast.framework.ui.ControlsSlot.SLOT_PRIMARY_2,
      cast.framework.ui.ControlsButton.SEEK_FORWARD_15
  );
  controls.assignButton(
      cast.framework.ui.ControlsSlot.SLOT_SECONDARY_2,
      cast.framework.ui.ControlsButton.QUEUE_NEXT
  );

  /*
   * Configure the CastReceiverOptions.
   */
  const castReceiverOptions = new cast.framework.CastReceiverOptions();
  castReceiverOptions.playbackConfig = playbackConfig;
  // castReceiverOptions.skipPlayersLoad = true;
  castReceiverOptions.disableIdleTimeout = true;
  castReceiverOptions.supportedCommands =
      cast.framework.messages.Command.ALL_BASIC_MEDIA |
      cast.framework.messages.Command.QUEUE_PREV |
      cast.framework.messages.Command.QUEUE_NEXT |
      cast.framework.messages.Command.STREAM_TRANSFER;
  // castReceiverOptions.customNamespaces = {};
  // castReceiverOptions.customNamespaces[NAMESPACE] = cast.framework.system.MessageType.JSON;

  /**
   * Enable Android TV Receiver (ATV) integration.
   * This allows the cast request to be intercepted by a native Android app
   * if it is installed on the receiver device.
   *
   * Make sure you have configured your Android package name in the
   * Google Cast Developer Console for this Application ID.
   */

  context.addEventListener(cast.framework.system.EventType.READY, () => {
      castDebugLogger.setEnabled(true);
      castDebugLogger.showDebugLogs(true);
  });

  playerManager.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD, loadRequestData => {
        show.value = true;
        const token = loadRequestData.media?.customData?.bearerToken;
        let source = loadRequestData.media.contentUrl
            || loadRequestData.media.entity || loadRequestData.media.contentId;

        const playbackConfig = playerManager.getPlaybackConfig();
        if (token && playbackConfig) {
          playbackConfig.manifestRequestHandler = requestInfo => {
            requestInfo.withCredentials = true;
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['Authorization'] = 'Bearer ' + token;
            return requestInfo;
          };

          playbackConfig.segmentRequestHandler = requestInfo => {
            requestInfo.withCredentials = true;
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['Authorization'] = 'Bearer ' + token;
            return requestInfo;
          };
        }

        loadRequestData.media.contentUrl = source;
        return loadRequestData;
      }
  );

  playerManager.setMessageInterceptor(
      cast.framework.messages.MessageType.LOAD, loadRequestData => {
        show.value = true;
        const token = loadRequestData.media?.customData?.bearerToken;
        let source = loadRequestData.media.contentUrl
            || loadRequestData.media.entity || loadRequestData.media.contentId;

        if (token) {
          window.playerManager.getPlaybackConfig().manifestRequestHandler = requestInfo => {
            requestInfo.withCredentials = true;
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['Authorization'] = 'Bearer ' + token;
            return requestInfo;
          };

          window.playerManager.getPlaybackConfig().segmentRequestHandler = requestInfo => {
            requestInfo.withCredentials = true;
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['Authorization'] = 'Bearer ' + token;
            return requestInfo;
          };
        }

        loadRequestData.media.contentUrl = source;
        return loadRequestData;
      }
  );

  context.start(castReceiverOptions);

});

</script>

<template>
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