import { QueryClient } from '@tanstack/vue-query'
import { queryConfigs } from './configs'

/**
 * Single shared QueryClient. Created in main.ts (not here) so plug-in
 * timing is correct relative to Vue mount; this module exposes a
 * setQueryClient hook used by main.ts and a getter used by everything
 * else (stores, composables, message handlers).
 */
let _client: QueryClient | null = null

export function setQueryClient(client: QueryClient): void {
  _client = client
}

export function getQueryClient(): QueryClient {
  if (!_client) {
    throw new Error('QueryClient not initialized — call setQueryClient first')
  }
  return _client
}

/**
 * Server-key → client-key shim per spec §6.2.
 *
 * Server's RefreshLibrary payload uses keys like `['base', 'libraries']`,
 * `['base', 'info', id]`, `['movie', id]`, `['tv', id]`. These don't match
 * the receiver's QueryKeys directly. The shim translates each server key
 * into one or more client keys, then invalidateFromServer fires
 * invalidateQueries on each.
 *
 * Copied verbatim from android (it lives there because the server's
 * RefreshLibrary contract predates both clients; fixing the server would
 * break web/android clients in the wild). Receiver matches that contract.
 */
export function mapServerKey(serverKey: readonly string[]): readonly (readonly string[])[] {
  if (!Array.isArray(serverKey) || serverKey.length === 0) return []

  const head = serverKey[0]
  const second = serverKey[1]
  const id = serverKey[2]

  // ['base', 'libraries'] → ['libraries']
  if (head === 'base' && second === 'libraries') {
    return [['libraries']]
  }

  // ['base', 'info', id] → all info queries (broad invalidate)
  if (head === 'base' && second === 'info') {
    return [['info']]
  }

  // ['movie', id] → ['info', 'movie', id]
  if (head === 'movie' && id !== undefined) {
    return [['info', 'movie', id]]
  }

  // ['tv', id] → ['info', 'tv', id]
  if (head === 'tv' && id !== undefined) {
    return [['info', 'tv', id]]
  }

  // Anything else: pass through (prefix match handles partial keys)
  return [serverKey]
}

/**
 * Fire invalidation for a server-emitted RefreshLibrary key. Translates
 * via mapServerKey then invalidates via TanStack — exact: false so prefix
 * matches catch nested queries.
 */
export function invalidateFromServer(serverKey: readonly string[]): void {
  if (!_client) return
  for (const clientKey of mapServerKey(serverKey)) {
    void _client.invalidateQueries({ queryKey: [...clientKey], exact: false })
  }
}

/**
 * Foreground resume sweep per spec §6.4. Triggered on cast_shell suspend
 * resume + visibilitychange hidden→visible + SignalR reconnect.
 */
export function invalidateAllLibrary(): void {
  if (!_client) return
  for (const prefix of [
    'home',
    'libraries',
    'library',
    'info',
    'card-items',
    'music',
    'search',
    'person',
    'component',
  ]) {
    void _client.invalidateQueries({ queryKey: [prefix], exact: false })
  }
}

/**
 * Stale sweep per spec §6.5. Walks the query cache and invalidates any
 * query whose dataUpdatedAt is older than 3 hours. Called on a 30min
 * cadence from main.ts via requestIdleCallback.
 */
export function staleSweep(maxAgeMs = 3 * 60 * 60_000): void {
  if (!_client) return
  const cutoff = Date.now() - maxAgeMs
  const queries = _client.getQueryCache().getAll()
  for (const q of queries) {
    if (q.state.dataUpdatedAt > 0 && q.state.dataUpdatedAt < cutoff) {
      void _client.invalidateQueries({ queryKey: q.queryKey, exact: true })
    }
  }
}

export const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      ...queryConfigs.standard,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
} as const
