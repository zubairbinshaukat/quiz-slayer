import type { IconName } from '../components/ui/Icon'

/** External links shown in the credit card and Settings → About. Empty href = hidden. */
export const DEV_NAME = 'Zubair Bin Shaukat'
export const DEV_SITE_URL = 'https://zubyr.dev'
export const GITHUB_REPO_URL = 'https://github.com/zubairbinshaukat/quiz-slayer'
export const LINKEDIN_URL: string = 'https://www.linkedin.com/in/zubairbinshaukat'

export interface DevLink {
  label: string
  href: string
  icon: IconName
  /** Settings → About row sub-line */
  hint: string
}

const ALL_LINKS: DevLink[] = [
  { label: 'Portfolio', href: DEV_SITE_URL, icon: 'user', hint: 'zubyr.dev' },
  { label: 'GitHub', href: GITHUB_REPO_URL, icon: 'github', hint: 'Source on GitHub' },
  { label: 'LinkedIn', href: LINKEDIN_URL, icon: 'linkedin', hint: 'Connect on LinkedIn' },
]

export const DEV_LINKS = ALL_LINKS.filter((l) => l.href !== '')
