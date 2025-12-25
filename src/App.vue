<script setup lang="ts">
import { onMounted, ref } from "vue";

import logo from '@/assets/logo-wide.svg';
import mobile from '@/assets/mobile.svg';
import splash from '@/assets/splash.png';

const show = ref(true);

onMounted(() => {
  if (!window.playerManager || !window.playerManager.setMessageInterceptor) {
    console.warn('playerManager or interceptor not available');
    return;
  }

  // window.playerManager.setMessageInterceptor(
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
  //   }
  // );
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