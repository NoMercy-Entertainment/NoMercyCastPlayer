import { inject, onBeforeUnmount, onMounted, provide, ref, type Ref } from 'vue'
import {
  focusStore,
  type Direction,
  type FocusGroupHandle,
  type FocusGroupType,
} from '@/stores/focusStore'
import { FocusGroupInjectionKey, type FocusEntry, type FocusGroupRegistry } from './useFocusEntry'

export interface FocusGroupOptions {
  type: FocusGroupType
  /** Stable key for per-route restoration memory. */
  restorationKey?: string
  /** Which child to focus first on mount, before restoration falls back. */
  initialFocusKey?: string
  /** For 'grid' type — column count. */
  columns?: number
  /** Called when focus tries to leave; return true to mark handled. */
  onEscape?: (dir: Direction) => boolean
  /** Container element for scroll-into-view bookkeeping. */
  containerEl?: Ref<HTMLElement | null>
}

/**
 * Focus group composable per spec §10.3. Provides FocusGroupRegistry to
 * nested useFocusEntry calls, registers itself on the focusStore stack,
 * implements neighbor-picking based on group type.
 */
export function useFocusGroup(opts: FocusGroupOptions): FocusGroupHandle & FocusGroupRegistry {
  const entries = ref<FocusEntry[]>([])
  const parent = inject(FocusGroupInjectionKey, null)

  function sortedEnabled(): FocusEntry[] {
    return [...entries.value]
      .sort((a, b) => a.order - b.order)
      .filter((e) => e.enabled !== false)
  }

  function pickNeighbor(current: FocusEntry, dir: Direction): FocusEntry | null {
    const list = sortedEnabled()
    const idx = list.indexOf(current)
    if (idx === -1) return null

    switch (opts.type) {
      case 'horizontal':
        if (dir === 'left') return list[idx - 1] ?? null
        if (dir === 'right') return list[idx + 1] ?? null
        return null
      case 'vertical':
        if (dir === 'up') return list[idx - 1] ?? null
        if (dir === 'down') return list[idx + 1] ?? null
        return null
      case 'grid': {
        const cols = Math.max(1, opts.columns ?? 1)
        if (dir === 'left') return list[idx - 1] ?? null
        if (dir === 'right') return list[idx + 1] ?? null
        if (dir === 'up') return list[idx - cols] ?? null
        if (dir === 'down') return list[idx + cols] ?? null
        return null
      }
      case 'modal':
      case 'free': {
        // Geometric closest-in-direction. Compute element rects and pick
        // the entry whose center is closest along the requested axis,
        // breaking ties by perpendicular distance.
        const currentEl = current.el()
        if (!currentEl) return null
        const cur = currentEl.getBoundingClientRect()
        const cx = cur.left + cur.width / 2
        const cy = cur.top + cur.height / 2

        let best: FocusEntry | null = null
        let bestScore = Infinity
        for (const e of list) {
          if (e === current) continue
          const el = e.el()
          if (!el) continue
          const r = el.getBoundingClientRect()
          const ex = r.left + r.width / 2
          const ey = r.top + r.height / 2
          const dx = ex - cx
          const dy = ey - cy
          const inDir =
            (dir === 'up' && dy < -1) ||
            (dir === 'down' && dy > 1) ||
            (dir === 'left' && dx < -1) ||
            (dir === 'right' && dx > 1)
          if (!inDir) continue
          const along = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx)
          const perp = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy)
          const score = along + perp * 2
          if (score < bestScore) {
            bestScore = score
            best = e
          }
        }
        return best
      }
    }
  }

  const handle: FocusGroupHandle & FocusGroupRegistry = {
    type: opts.type,
    register(entry) {
      entries.value.push(entry)
      return () => {
        entries.value = entries.value.filter((e) => e !== entry)
      }
    },
    focusByKey(key) {
      const e = entries.value.find((x) => x.key === key && x.enabled !== false)
      if (!e) return false
      e.focus()
      return true
    },
    focusFirst() {
      const list = sortedEnabled()
      const e = list[0]
      if (!e) return false
      e.focus()
      return true
    },
    focusLast() {
      const list = sortedEnabled()
      const e = list[list.length - 1]
      if (!e) return false
      e.focus()
      return true
    },
    hasEntry(key) {
      return entries.value.some((e) => e.key === key)
    },
    handleKey(dir) {
      const current = entries.value.find((e) => e.isFocused())
      if (!current) return handle.focusFirst()
      const target = pickNeighbor(current, dir)
      if (target) {
        target.focus()
        return true
      }
      if (opts.type === 'modal') return true
      if (opts.onEscape?.(dir)) return true
      return parent?.handleKey(dir) ?? false
    },
    dispatchEscape() {
      return opts.onEscape?.('back') ?? false
    },
  }

  provide(FocusGroupInjectionKey, handle)

  onMounted(() => {
    focusStore.pushGroup(handle)
    if (opts.restorationKey) {
      const restored = focusStore.consumeRestoration(opts.restorationKey)
      if (restored && handle.focusByKey(restored)) return
    }
    if (opts.initialFocusKey && handle.focusByKey(opts.initialFocusKey)) return
    handle.focusFirst()
  })

  onBeforeUnmount(() => {
    if (opts.restorationKey) {
      const focused = entries.value.find((e) => e.isFocused())
      if (focused) focusStore.saveRestoration(opts.restorationKey, focused.key)
    }
    focusStore.popGroup(handle)
  })

  return handle
}
