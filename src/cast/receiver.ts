import type { Router } from 'vue-router'
import { ALL_CUSTOM_NAMESPACES } from './namespaces'
import { attachLaunchListener, consumeLaunchAuth } from './launchAuth'
import { attachMessageBus, onSenderIntent, onSenderLaunch } from './messageBus'
import { authStore } from '@/stores/authStore'
import { navStore } from '@/stores/navStore'
import { socketStore } from '@/stores/socketStore'
import type { LaunchCustomData } from '@/types/cast'

/**
 * Cast receiver bootstrap. Called once from main.ts after the Vue app
 * mounts. Wires custom namespaces, attaches launch listeners, and forwards
 * the initial intent into vue-router.
 *
 * disableIdleTimeout: true keeps the session alive past Cast's default 5min
 * idle timeout — receiver-side screensaver handling lands in Phase 10.
 *
 * Const-enum values from @types/chromecast-caf-receiver can't be accessed
 * through ambient namespaces under isolatedModules; we use the equivalent
 * string literals at runtime — both resolve to the same enum value.
 */
export function bootCastReceiver(router: Router): void {
  // Runtime guard — the CAF SDK <script> in index.html may fail to load in
  // dev preview. Without it we render the splash and skip cast wiring.
  const castGlobal = (globalThis as { cast?: unknown }).cast as
    | {
        framework?: {
          CastReceiverContext: {
            getInstance: () => unknown
          }
          CastReceiverOptions: new () => Record<string, unknown>
          system: { MessageType: { JSON: string } }
        }
      }
    | undefined

  if (!castGlobal?.framework) {
    console.warn('[cast] CAF SDK not loaded — running in non-cast preview mode')
    return
  }

  const context = castGlobal.framework.CastReceiverContext.getInstance() as {
    addEventListener: (type: string, listener: (event: unknown) => void) => void
    addCustomMessageListener: (
      namespace: string,
      listener: (event: { senderId?: string; data: unknown }) => void,
    ) => void
    sendCustomMessage: (
      namespace: string,
      senderId: string | undefined,
      data: unknown,
    ) => void
    getApplicationData: () => unknown
    start: (options: Record<string, unknown>) => void
  }

  const options = new castGlobal.framework.CastReceiverOptions()
  options.disableIdleTimeout = true
  options.skipPlayersLoad = true
  options.customNamespaces = Object.fromEntries(
    ALL_CUSTOM_NAMESPACES.map((ns) => [ns, 'JSON']),
  )

  attachMessageBus(context)

  attachLaunchListener(context, (data: LaunchCustomData) => {
    if (consumeLaunchAuth(data)) {
      authStore.receiverState.value = 'AUTHED'
      void bootSocketsAndDispatch(data, router)
    }
  })

  onSenderLaunch((data) => {
    if (consumeLaunchAuth(data)) {
      authStore.receiverState.value = 'AUTHED'
      void bootSocketsAndDispatch(data, router)
    }
  })

  onSenderIntent((intent) => {
    navStore.dispatchInitialIntent(intent, router)
  })

  context.addEventListener('SHUTDOWN', () => {
    void socketStore.disconnectAll()
    authStore.clear()
  })

  context.start(options)
}

/**
 * Boot SignalR + dispatch initial intent. Sequenced so the receiver's
 * Vue components can read live socket state (and fire RPC commands) by
 * the time their first `onMounted` lifecycle runs.
 *
 * SignalR connection failure does NOT block intent dispatch — the UI
 * shows the splash / browse view with the connection-state badge, and
 * forever-retry recovers in the background.
 */
async function bootSocketsAndDispatch(
  data: LaunchCustomData,
  router: Router,
): Promise<void> {
  authStore.receiverState.value = 'CONNECTING'
  void socketStore.connectAll().then(() => {
    authStore.receiverState.value = 'READY'
  })
  navStore.dispatchInitialIntent(data.intent, router)
}
