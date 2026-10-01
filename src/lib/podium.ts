/** Restart the podium choreography: remove `.play`, force a reflow, add it back. */
export function replayPodium(el: HTMLElement | null): void {
  if (!el) return
  el.classList.remove('play')
  void el.offsetWidth
  el.classList.add('play')
}
