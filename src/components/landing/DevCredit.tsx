import { Icon } from '../ui/Icon'

export function DevCredit() {
  return (
    <footer className="mt-14 flex justify-center border-t border-line pt-8">
      <a
        href="https://www.zubyr.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="press group flex min-h-11 items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 hover:bg-surface-2"
      >
        <img
          src="https://avatars.githubusercontent.com/u/145450776?v=4"
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          className="size-10 rounded-full object-cover ring-2 ring-accent/60"
        />
        <span className="text-left">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">Built by</span>
          <span className="block text-sm font-bold group-hover:text-accent-fg">Zubair Bin Shaukat</span>
        </span>
        <Icon name="forward" size={16} className="text-muted" />
      </a>
    </footer>
  )
}
