import { dispatchOptionAction } from './shared'

export interface EpisodeItem {
  id: number | string
  season?: number
  episode?: number
  title: string
}

export interface EpisodeScreenOptions {
  parent: HTMLElement
  episodes: EpisodeItem[]
  currentId?: number | string
  onPick: (item: EpisodeItem) => void
  onExit: () => void
}

export function mountEpisodeScreen(opts: EpisodeScreenOptions): () => void {
  const root = document.createElement('div')
  root.className = 'panel episode-screen'
  root.setAttribute('role', 'dialog')

  const heading = document.createElement('h2')
  heading.textContent = 'Episodes'

  const list = document.createElement('div')
  list.className = 'episode-list'

  for (const ep of opts.episodes) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'panel-button episode-row'
    btn.dataset.focusable = 'true'
    btn.tabIndex = 0
    if (ep.id === opts.currentId) btn.classList.add('current')
    btn.textContent =
      typeof ep.season === 'number' && typeof ep.episode === 'number'
        ? `S${ep.season}E${ep.episode} — ${ep.title}`
        : ep.title
    btn.addEventListener('click', () => opts.onPick(ep))
    list.append(btn)
  }

  root.append(heading, list)
  opts.parent.append(root)

  const first = list.querySelector<HTMLElement>('[data-focusable]')
  requestAnimationFrame(() => first?.focus())

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' || e.key === 'Back' || e.key === 'GoBack' || e.key === 'BrowserBack') {
      e.preventDefault()
      opts.onExit()
    }
  }
  root.addEventListener('keydown', onKey, true)
  dispatchOptionAction(root, list, 'vertical')

  return (): void => {
    root.removeEventListener('keydown', onKey, true)
    root.remove()
  }
}
