import { createApp } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import { bootCastReceiver } from './cast/receiver'
import './styles/tailwind.css'

/**
 * Bootstrap order:
 *   1. Construct query client (config tuned in Phase 2 — for now defaults).
 *   2. Mount Vue app with router + query client.
 *   3. Boot cast receiver — wires custom namespaces, attaches launch
 *      listener, dispatches initial intent into router.
 *
 * The CAF SDK is loaded synchronously in index.html before main.ts runs,
 * so cast.framework is available by the time bootCastReceiver fires.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')

bootCastReceiver(router)
