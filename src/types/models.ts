/**
 * Shared receiver-wide model types. Server-component types live in
 * src/server-components/types.ts (Phase 4).
 */

export interface UserProfile {
  id: string
  preferred_username?: string
  display_name?: string
  email?: string
  given_name?: string
  family_name?: string
  locale?: string
}

export interface ServerInfo {
  id: string
  url: string
}
