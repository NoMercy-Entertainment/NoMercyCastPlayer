import { onBeforeUnmount, onMounted } from 'vue'
import type { Router } from 'vue-router'
import { focusStore } from '@/stores/focusStore'

/**
 * Window-level D-pad handler per spec §10.5. Mounted once at App.vue.
 * Handles arrow keys, Enter, and the cluster of Back-equivalent keys
 * (Escape / Back / GoBack / BrowserBack) used by various smart-TV remote
 * shells.
 */

const DPAD_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Escape',
  'Back',
  'GoBack',
  'BrowserBack',
])

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

export function useDPad(router: Router): void {
  function handler(e: KeyboardEvent): void {
    if (!DPAD_KEYS.has(e.key)) return
    if (isInputFocused()) return

    const active = focusStore.activeGroup()
    let handled = false

    switch (e.key) {
      case 'ArrowUp':
        handled = active?.handleKey('up') ?? false
        break
      case 'ArrowDown':
        handled = active?.handleKey('down') ?? false
        break
      case 'ArrowLeft':
        handled = active?.handleKey('left') ?? false
        break
      case 'ArrowRight':
        handled = active?.handleKey('right') ?? false
        break
      case 'Enter':
        handled = focusStore.dispatchAction()
        break
      case 'Escape':
      case 'Back':
      case 'GoBack':
      case 'BrowserBack':
        handled = handleBack(router)
        break
    }

    if (handled) e.preventDefault()
  }

  onMounted(() => window.addEventListener('keydown', handler, { capture: true }))
  onBeforeUnmount(() => window.removeEventListener('keydown', handler, true))
}

function handleBack(router: Router): boolean {
  // Modal on top? Close it via dispatchEscape.
  const top = focusStore.activeGroup()
  if (top?.type === 'modal') {
    return focusStore.dispatchEscape()
  }
  // Otherwise router back. At root we let cast_shell decide (which
  // typically does nothing).
  if (router.currentRoute.value.path !== '/') {
    router.back()
    return true
  }
  return false
}
