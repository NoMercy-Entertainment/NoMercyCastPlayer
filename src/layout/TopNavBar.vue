<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFocusGroup } from '@/composables/useFocusGroup'
import NowPlayingPill from './NowPlayingPill.vue'
import ProfileChip from './ProfileChip.vue'
import NavLink from './NavLink.vue'

interface NavItem {
  key: string
  label: string
  path: string
}

const items: NavItem[] = [
  { key: 'nav-home', label: 'Home', path: '/' },
  { key: 'nav-search', label: 'Search', path: '/search' },
  { key: 'nav-libraries', label: 'Libraries', path: '/libraries' },
  { key: 'nav-music', label: 'Music', path: '/music' },
]

const navEl = ref<HTMLElement | null>(null)
const router = useRouter()
const route = useRoute()

useFocusGroup({
  type: 'horizontal',
  restorationKey: 'topnav',
  containerEl: navEl,
})
</script>

<template>
  <header class="topnav">
    <div class="brand">
      <span class="logo-mark">NM</span>
    </div>
    <nav ref="navEl" class="nav-items">
      <NavLink
        v-for="item in items"
        :key="item.key"
        :focus-key="item.key"
        :label="item.label"
        :path="item.path"
        :active="route.path === item.path"
        @action="(p) => router.push(p)"
      />
    </nav>
    <div class="trailing">
      <NowPlayingPill />
      <ProfileChip />
    </div>
  </header>
</template>

<style scoped>
.topnav {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 16px var(--tv-safe-padding);
  height: var(--topnav-height);
}
.brand {
  font-weight: 800;
  font-size: 24px;
}
.logo-mark {
  background: linear-gradient(135deg, oklch(0.85 0.18 35), oklch(0.6 0.2 285));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.nav-items {
  display: flex;
  gap: 8px;
}
.trailing {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
