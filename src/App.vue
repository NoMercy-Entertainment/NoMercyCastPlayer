<script setup lang="ts">
import { ref, onMounted } from "vue";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

// Reactive state for status and debug logs
const status = ref('Ready to cast');
const debugLog = ref<string[]>([]);
const isConnected = ref(false);

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logMsg = `[${timestamp}] ${message}`;
  console.log(logMsg);

  debugLog.value.push(logMsg);
  if (debugLog.value.length > 15) {
    debugLog.value.shift();
  }
}

function updateStatus(text: string) {
  status.value = text;
  log('Status: ' + text);
}

onMounted(() => {
  const CUSTOM_NAMESPACE = 'urn:x-cast:tv.nomercy.app';

  try {
    const context = cast.framework.CastReceiverContext.getInstance();
    const playerManager = context.getPlayerManager();

    // Configure receiver options with Cast Connect support
    const options = new cast.framework.CastReceiverOptions();

    // CRITICAL: Enable Cast Connect to launch Android TV app
    options.androidReceiverCompatible = true;

    // Set to true to keep receiver alive even when idle
    options.disableIdleTimeout = true;

    // Max idle time (if not disabled)
    options.maxInactivity = 3600; // 1 hour

    log('Receiver options configured with androidReceiverCompatible=true');

    // Listen for custom messages from sender (phone app)
    context.addCustomMessageListener(CUSTOM_NAMESPACE, function (customEvent) {
      log('Received message from ' + customEvent.senderId);
      const senderId = customEvent.senderId;
      const message = customEvent.data;

      try {
        // Parse message if it's a string
        const messageData = typeof message === 'string' ? JSON.parse(message) : message;
        log('Message type: ' + messageData.type);

        updateStatus('Processing: ' + messageData.type);

        // Send acknowledgment back to sender
        const response = {
          type: 'RESPONSE',
          success: true,
          message: 'Web receiver received: ' + messageData.type,
          note: 'Android TV app should handle this natively via Cast Connect'
        };

        context.sendCustomMessage(CUSTOM_NAMESPACE, senderId, response);
        log('Sent response to ' + senderId);

      } catch (error: any) {
        log('ERROR: ' + error.message);
        updateStatus('Error: ' + error.message);

        try {
          context.sendCustomMessage(CUSTOM_NAMESPACE, senderId, {
            type: 'RESPONSE',
            success: false,
            message: 'Error: ' + error.message
          });
        } catch (e: any) {
          log('Failed to send error response: ' + e.message);
        }
      }
    });

    // Handle sender connection
    context.addEventListener(cast.framework.system.EventType.SENDER_CONNECTED, function (event) {
      log('Sender connected: ' + event.senderId);
      isConnected.value = true;
      updateStatus('Phone connected - launching Android TV app...');
    });

    // Handle sender disconnection
    context.addEventListener(cast.framework.system.EventType.SENDER_DISCONNECTED, function (event) {
      log('Sender disconnected: ' + event.senderId);
      isConnected.value = false;
      updateStatus('Ready to cast');
    });

    // Handle ready event
    context.addEventListener(cast.framework.system.EventType.READY, function (event) {
      log('Receiver ready');
      updateStatus('Ready to cast');
    });

    // Handle errors
    context.addEventListener(cast.framework.system.EventType.ERROR, function (event) {
      log('ERROR EVENT: ' + JSON.stringify(event));
      updateStatus('Error occurred - check logs');
    });

    // Start the receiver with Cast Connect enabled
    context.start(options);
    log('Cast receiver started with Cast Connect support');
    updateStatus('Ready to cast');

  } catch (error: any) {
    log('FATAL ERROR: ' + error.message);
    updateStatus('Fatal error: ' + error.message);
    console.error('Cast receiver error:', error);
  }

  // Additional debug info
  log('Custom namespace: ' + CUSTOM_NAMESPACE);
  log('User agent: ' + navigator.userAgent.substring(0, 50) + '...');
});

</script>

<template>
  <div
    class="splash w-full h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#232323] to-[#161616] px-[100px] py-[45px]">

    <!-- Background splash image -->
    <img class="w-full h-auto absolute inset-0 aspect-video" :src="splash" alt="NoMercy Entertainment Logo" />

    <!-- Main content - status and instructions -->
    <div class="relative flex flex-col justify-start items-start w-[625px] gap-4">

      <!-- Dynamic status with connection indicator -->
      <div class="flex items-center gap-4">
        <p :class="['text-[40px] font-black text-left text-[#ededed] leading-none', {
          'pulse': !isConnected
        }]">
          {{ status }}
        </p>

        <!-- Connection indicator dot -->
        <div v-if="isConnected" class="w-4 h-4 rounded-full bg-green-500 animate-pulse" title="Connected"></div>
      </div>

      <!-- Instructions -->
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

      <!-- Cast Connect info badge -->
      <div v-if="isConnected" class="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg">
        <p class="text-sm text-blue-200">
          🔗 Cast Connect enabled - Android TV app should be launching...
        </p>
      </div>
    </div>

    <!-- Debug panel (styled to match your design) -->
    <div v-if="debugLog.length > 0"
      class="absolute right-[50px] top-[45px] w-[400px] max-h-[calc(100vh-90px)] z-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 overflow-hidden">
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <h3 class="text-sm font-bold text-white/90">Debug Console</h3>
        <button @click="debugLog = []" class="text-xs text-white/50 hover:text-white/90 transition-colors">
          Clear
        </button>
      </div>

      <div class="overflow-y-auto max-h-[calc(100vh-180px)] space-y-1">
        <div v-for="(entry, index) in debugLog" :key="index"
          class="text-xs font-mono text-green-400/90 leading-relaxed">
          {{ entry }}
        </div>
      </div>
    </div>

    <!-- Mobile icon -->
    <img class="relative w-[208px] h-[232px]" :src="mobile" alt="NoMercy Entertainment Logo" />

    <!-- NoMercy logo -->
    <img class="flex-grow-0 flex-shrink-0 w-min h-10 relative" :src="logo" alt="NoMercy Entertainment Logo" />
  </div>
</template>

<style scoped>
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

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

/* Smooth scrollbar for debug panel */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
