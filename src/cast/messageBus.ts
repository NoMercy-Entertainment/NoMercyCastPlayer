import { NAMESPACE_INTENT, NAMESPACE_STATUS } from './namespaces'
import type { CastIntent, LaunchCustomData } from '@/types/cast'

/**
 * Outbound + inbound custom-namespace message bus.
 *
 * Phase 1 wires the listener for intent pushes (sender → receiver post-LAUNCH
 * navigation pushes) and a stub status broadcaster. Status payload schema
 * solidifies in Phase 2 once SignalR is providing authoritative state.
 */

type IntentHandler = (intent: CastIntent) => void
type LaunchHandler = (data: LaunchCustomData) => void

interface ReceiverContextLike {
  addCustomMessageListener: (
    namespace: string,
    listener: (event: { senderId?: string; data: unknown }) => void,
  ) => void
  sendCustomMessage: (
    namespace: string,
    senderId: string | undefined,
    data: unknown,
  ) => void
}

let context: ReceiverContextLike | null = null
let intentHandlers: IntentHandler[] = []
let launchHandlers: LaunchHandler[] = []

export function attachMessageBus(ctx: ReceiverContextLike): void {
  context = ctx

  ctx.addCustomMessageListener(NAMESPACE_INTENT, (event) => {
    const data = event.data as
      | { type?: string; intent?: CastIntent; launch?: LaunchCustomData }
      | undefined
    if (data?.type === 'launch' && data.launch) {
      for (const fn of launchHandlers) fn(data.launch)
      return
    }
    if (data?.intent) {
      for (const fn of intentHandlers) fn(data.intent)
      return
    }
    if (
      data?.type === 'navigate' ||
      data?.type === 'play_video' ||
      data?.type === 'play_music'
    ) {
      for (const fn of intentHandlers) fn(data as unknown as CastIntent)
      return
    }
    console.debug('[cast] intent message ignored', data)
  })
}

export function onSenderIntent(handler: IntentHandler): () => void {
  intentHandlers.push(handler)
  return () => {
    intentHandlers = intentHandlers.filter((h) => h !== handler)
  }
}

export function onSenderLaunch(handler: LaunchHandler): () => void {
  launchHandlers.push(handler)
  return () => {
    launchHandlers = launchHandlers.filter((h) => h !== handler)
  }
}

export function broadcastStatus(payload: Record<string, unknown>): void {
  if (!context) return
  try {
    context.sendCustomMessage(NAMESPACE_STATUS, undefined, payload)
  } catch (err) {
    console.warn('[cast] status broadcast failed', err)
  }
}
