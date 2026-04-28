import type { QueryClient } from '@tanstack/vue-query'

/**
 * Server-key → client-key shim per spec §6.2.
 *
 * Lives in lib/ rather than queries/ because the socketStore (which
 * lives in stores/) needs to call invalidateFromServer on RefreshLibrary
 * events. Per spec §7.1, stores/ is allowed to import from lib/ but not
 * from queries/.
 *
 * The QueryClient singleton is owned by queries/client.ts; this module
 * re-uses it via a getter passed in at registration time. Phase 2's
 * main.ts registers the singleton, then both queries/ and stores/
 * resolve it through here.
 */

let getClient: (() => QueryClient) | null = null

export function registerQueryClientGetter(getter: () => QueryClient): void {
  getClient = getter
}

export function mapServerKey(serverKey: readonly string[]): readonly (readonly string[])[] {
  if (!Array.isArray(serverKey) || serverKey.length === 0) return []

  const head = serverKey[0]
  const second = serverKey[1]
  const id = serverKey[2]

  if (head === 'base' && second === 'libraries') return [['libraries']]
  if (head === 'base' && second === 'info') return [['info']]
  if (head === 'movie' && id !== undefined) return [['info', 'movie', id]]
  if (head === 'tv' && id !== undefined) return [['info', 'tv', id]]
  return [serverKey]
}

export function invalidateFromServer(serverKey: readonly string[]): void {
  const client = getClient?.()
  if (!client) return
  for (const clientKey of mapServerKey(serverKey)) {
    void client.invalidateQueries({ queryKey: [...clientKey], exact: false })
  }
}

export function invalidateAllLibrary(): void {
  const client = getClient?.()
  if (!client) return
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
    void client.invalidateQueries({ queryKey: [prefix], exact: false })
  }
}

export function staleSweep(maxAgeMs = 3 * 60 * 60_000): void {
  const client = getClient?.()
  if (!client) return
  const cutoff = Date.now() - maxAgeMs
  const queries = client.getQueryCache().getAll()
  for (const q of queries) {
    if (q.state.dataUpdatedAt > 0 && q.state.dataUpdatedAt < cutoff) {
      void client.invalidateQueries({ queryKey: q.queryKey, exact: true })
    }
  }
}
