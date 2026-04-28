/**
 * Custom Cast namespaces per spec §8.3.
 *
 * SignalR is the substantive control channel; these namespaces are
 * skeletal — used for the LAUNCH customData carrier, status broadcasts,
 * and post-LAUNCH sender intent pushes.
 */

export const NAMESPACE_GENERAL = 'urn:x-cast:tv.nomercy.app'
export const NAMESPACE_STATUS = 'urn:x-cast:tv.nomercy.cast.status'
export const NAMESPACE_INTENT = 'urn:x-cast:tv.nomercy.intent'

export const ALL_CUSTOM_NAMESPACES = [
  NAMESPACE_GENERAL,
  NAMESPACE_STATUS,
  NAMESPACE_INTENT,
] as const
