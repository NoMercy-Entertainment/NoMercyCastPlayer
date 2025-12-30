<script setup lang="ts">
import { onMounted, ref } from "vue";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

const show = ref(false);

onMounted(() => {
  // const NAMESPACE = 'urn:x-cast:tv.nomercy.app';
  // const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
  // const context = cast.framework.CastReceiverContext.getInstance();
  // const playerManager = context.getPlayerManager();
  // const LOG_TAG = 'MyReceiverApp';

  // /*
  //  * Set the player configuration.
  //  */
  // const playbackConfig = new cast.framework.PlaybackConfig();
  // playbackConfig.autoResumeDuration = 5;

  // const controls = cast.framework.ui.Controls.getInstance();
  // controls.clearDefaultSlotAssignments();

  // // Assign buttons to control slots.
  // controls.assignButton(
  //     cast.framework.ui.ControlsSlot.SLOT_SECONDARY_1,
  //     cast.framework.ui.ControlsButton.QUEUE_PREV
  // );
  // controls.assignButton(
  //     cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
  //     cast.framework.ui.ControlsButton.CAPTIONS
  // );
  // controls.assignButton(
  //     cast.framework.ui.ControlsSlot.SLOT_PRIMARY_2,
  //     cast.framework.ui.ControlsButton.SEEK_FORWARD_15
  // );
  // controls.assignButton(
  //     cast.framework.ui.ControlsSlot.SLOT_SECONDARY_2,
  //     cast.framework.ui.ControlsButton.QUEUE_NEXT
  // );

  // /*
  //  * Configure the CastReceiverOptions.
  //  */
  // const castReceiverOptions = new cast.framework.CastReceiverOptions();
  // castReceiverOptions.playbackConfig = playbackConfig;
  // // castReceiverOptions.skipPlayersLoad = true;
  // castReceiverOptions.disableIdleTimeout = true;
  // castReceiverOptions.supportedCommands =
  //     cast.framework.messages.Command.ALL_BASIC_MEDIA |
  //     cast.framework.messages.Command.QUEUE_PREV |
  //     cast.framework.messages.Command.QUEUE_NEXT |
  //     cast.framework.messages.Command.STREAM_TRANSFER;
  // // castReceiverOptions.customNamespaces = {};
  // // castReceiverOptions.customNamespaces[NAMESPACE] = cast.framework.system.MessageType.JSON;

  // /**
  //  * Enable Android TV Receiver (ATV) integration.
  //  * This allows the cast request to be intercepted by a native Android app
  //  * if it is installed on the receiver device.
  //  *
  //  * Make sure you have configured your Android package name in the
  //  * Google Cast Developer Console for this Application ID.
  //  */

  // context.addEventListener(cast.framework.system.EventType.READY, () => {
  //     castDebugLogger.setEnabled(true);
  //     castDebugLogger.showDebugLogs(true);
  // });

  // playerManager.setMessageInterceptor(
  //     cast.framework.messages.MessageType.LOAD, loadRequestData => {
  //       show.value = true;
  //       const token = loadRequestData.media?.customData?.bearerToken;
  //       let source = loadRequestData.media.contentUrl
  //           || loadRequestData.media.entity || loadRequestData.media.contentId;

  //       const playbackConfig = playerManager.getPlaybackConfig();
  //       if (token && playbackConfig) {
  //         playbackConfig.manifestRequestHandler = requestInfo => {
  //           requestInfo.withCredentials = true;
  //           requestInfo.headers = requestInfo.headers || {};
  //           requestInfo.headers['Authorization'] = 'Bearer ' + token;
  //           return requestInfo;
  //         };

  //         playbackConfig.segmentRequestHandler = requestInfo => {
  //           requestInfo.withCredentials = true;
  //           requestInfo.headers = requestInfo.headers || {};
  //           requestInfo.headers['Authorization'] = 'Bearer ' + token;
  //           return requestInfo;
  //         };
  //       }

  //       loadRequestData.media.contentUrl = source;
  //       return loadRequestData;
  //     }
  // );

  // playerManager.setMessageInterceptor(
  //     cast.framework.messages.MessageType.LOAD, loadRequestData => {
  //       show.value = true;
  //       const token = loadRequestData.media?.customData?.bearerToken;
  //       let source = loadRequestData.media.contentUrl
  //           || loadRequestData.media.entity || loadRequestData.media.contentId;

  //       if (token) {
  //         window.playerManager.getPlaybackConfig().manifestRequestHandler = requestInfo => {
  //           requestInfo.withCredentials = true;
  //           requestInfo.headers = requestInfo.headers || {};
  //           requestInfo.headers['Authorization'] = 'Bearer ' + token;
  //           return requestInfo;
  //         };

  //         window.playerManager.getPlaybackConfig().segmentRequestHandler = requestInfo => {
  //           requestInfo.withCredentials = true;
  //           requestInfo.headers = requestInfo.headers || {};
  //           requestInfo.headers['Authorization'] = 'Bearer ' + token;
  //           return requestInfo;
  //         };
  //       }

  //       loadRequestData.media.contentUrl = source;
  //       return loadRequestData;
  //     }
  // );

  // context.start(castReceiverOptions);

  const CUSTOM_NAMESPACE = 'urn:x-cast:tv.nomercy.app';

  const context = cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  // Configure receiver options
  const options = new cast.framework.CastReceiverOptions();

  // Enable Cast Connect to work with Android TV app
  options.androidReceiverCompatible = true;

  // Disable default media element (we're controlling Android TV app instead)
  options.disableIdleTimeout = true;

  console.log('NoMercy Cast Receiver initializing...');

  // Listen for custom messages from sender (phone app)
  context.addCustomMessageListener(CUSTOM_NAMESPACE, function(customEvent) {
      console.log('Received custom message:', customEvent);
      const senderId = customEvent.senderId;
      const message = customEvent.data;

      try {
          // If message is a string, parse it
          const messageData = typeof message === 'string' ? JSON.parse(message) : message;
          console.log('Parsed message:', messageData);

          // Update status display
          updateStatus('Connected - ' + messageData.type);

          // Echo the message back to confirm receipt
          context.sendCustomMessage(CUSTOM_NAMESPACE, senderId, {
              type: 'RESPONSE',
              success: true,
              message: 'Web receiver got: ' + messageData.type
          });

          // NOTE: In Cast Connect mode, the Android TV app should receive this message directly
          // This web receiver acts as a fallback and bridge

      } catch (error) {
          console.error('Error processing message:', error);
          context.sendCustomMessage(CUSTOM_NAMESPACE, senderId, {
              type: 'RESPONSE',
              success: false,
              message: 'Error: ' + error.message
          });
      }
  });

  // Handle sender connection
  context.addEventListener(cast.framework.system.EventType.SENDER_CONNECTED, function(event) {
      console.log('Sender connected:', event.senderId);
      updateStatus('Phone connected');
  });

  // Handle sender disconnection
  context.addEventListener(cast.framework.system.EventType.SENDER_DISCONNECTED, function(event) {
      console.log('Sender disconnected:', event.senderId);
      updateStatus('Phone disconnected');
  });

  // Handle ready event
  context.addEventListener(cast.framework.system.EventType.READY, function(event) {
      console.log('Receiver ready');
      updateStatus('Ready');
  });

  // Start the receiver
  context.start(options);
  console.log('NoMercy Cast Receiver started');

  function updateStatus(text) {
      const statusEl = document.getElementById('status');
      if (statusEl) {
          statusEl.textContent = text;
      }
  }

  // Log all events for debugging
  const eventTypes = cast.framework.system.EventType;
  Object.keys(eventTypes).forEach(function(key) {
      context.addEventListener(eventTypes[key], function(event) {
          console.log('Event:', key, event);
      });
  });

});

</script>

<template>
  <!-- <cast-media-player :class="{
    'opacity-0': !show,
    'opacity-100': show
  }"></cast-media-player>


    <div id="splash">
        <div id="logo">NoMercy</div>
        <div id="status" class="pulse">Connecting to TV...</div>
    </div> -->

  <div
    class="splash w-full h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#232323] to-[#161616] px-[100px] py-[45px]">

    <img class="w-full h-auto absolute inset-0 aspect-video" :src="splash" alt="NoMercy Entertainment Logo" />

    <div class="relative flex flex-col justify-start items-start w-[625px] gap-4">

      <p
       id="status"
        class="pulse self-stretch flex-grow-0 flex-shrink-0 w-[625px] text-[40px] font-black text-left text-[#ededed] leading-none">
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

<style>
  
  body {
      margin: 0;
      padding: 0;
      background: #000;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
  }
  #status {
      font-size: 18px;
      opacity: 0.7;
      margin-top: 20px;
  }
  .pulse {
      animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
  }
</style>