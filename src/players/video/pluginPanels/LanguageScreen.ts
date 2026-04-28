import { dispatchOptionAction } from './shared'

export interface TrackItem {
  id: string | number
  label: string
}

export interface LanguageScreenOptions {
  parent: HTMLElement
  audioTracks: TrackItem[]
  subtitleTracks: TrackItem[]
  currentAudioId?: string | number | null
  currentSubtitleId?: string | number | null
  onPickAudio: (id: string | number) => void
  onPickSubtitle: (id: string | number) => void
  onExit: () => void
}

export function mountLanguageScreen(opts: LanguageScreenOptions): () => void {
  const root = document.createElement('div')
  root.className = 'panel language-screen'
  root.setAttribute('role', 'dialog')

  const heading = document.createElement('h2')
  heading.textContent = 'Audio and subtitles'

  const audio = section('Audio', opts.audioTracks, opts.currentAudioId, (id) =>
    opts.onPickAudio(id),
  )
  const subs = section(
    'Subtitles',
    [{ id: 'off', label: 'Off' }, ...opts.subtitleTracks],
    opts.currentSubtitleId,
    (id) => opts.onPickSubtitle(id),
  )

  const list = document.createElement('div')
  list.className = 'language-list'
  list.append(audio, subs)

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

function section(
  label: string,
  tracks: TrackItem[],
  currentId: string | number | null | undefined,
  onPick: (id: string | number) => void,
): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'lang-section'

  const h = document.createElement('h3')
  h.textContent = label
  wrap.append(h)

  for (const t of tracks) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'panel-button track-row'
    btn.dataset.focusable = 'true'
    btn.tabIndex = 0
    if (t.id === currentId) btn.classList.add('current')
    btn.textContent = t.label
    btn.addEventListener('click', () => onPick(t.id))
    wrap.append(btn)
  }

  return wrap
}
