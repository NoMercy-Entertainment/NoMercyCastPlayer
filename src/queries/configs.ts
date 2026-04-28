/**
 * Cache TTL configs per spec §6.8 — mirrors android QueryConfigs.
 *
 * realtime  — current playback / device state, refresh aggressively
 * standard  — typical browse data
 * static    — library descriptions, person metadata, etc — rarely changes
 * infinite  — config-style data baked into the session
 */

export const queryConfigs = {
  realtime: {
    staleTime: 30_000,
    gcTime: 60_000,
  },
  standard: {
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  },
  static: {
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  infinite: {
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
} as const

export type QueryConfigKey = keyof typeof queryConfigs
