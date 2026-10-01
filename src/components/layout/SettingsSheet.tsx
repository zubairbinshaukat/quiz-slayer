import type { ReactNode } from 'react'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { useTheme } from '../../hooks/useTheme'
import type { ThemePref } from '../../context/themeContextDef'
import { convexEnabled } from '../../lib/convex'
import type { LitePref } from '../../lib/liteMode'
import { DevicesSetting } from '../devices/DevicesSetting'
import { DEV_LINKS, DEV_NAME } from '../../lib/links'
import { ZubyrMark } from '../brand/ZubyrMark'
import { Icon, type IconName } from '../ui/Icon'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import { Switch } from '../ui/Switch'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0" aria-label={title}>
      <h3 className="eyebrow mb-2 px-1">{title}</h3>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface-2">{children}</div>
    </section>
  )
}

function SettingRow({ icon, title, hint, control, children }: { icon: IconName; title: string; hint?: string; control?: ReactNode; children?: ReactNode }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-fg" aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight">{title}</p>
          {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
        </div>
        {control}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

function ExternalRow({ href, lead, title, hint }: { href: string; lead: ReactNode; title: string; hint: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="press flex items-center gap-3 px-4 py-3.5 hover:bg-surface-3"
      aria-label={`${title} (opens in a new tab)`}
    >
      {lead}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{title}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>
      </span>
      <Icon name="external" size={16} className="shrink-0 text-muted" />
    </a>
  )
}

/** Appearance, sound, performance, devices and about, grouped like a native settings screen. */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pref: themePref, setPref: setThemePref } = useTheme()
  const { soundEnabled, toggleSound } = useSound()
  const { pref, detected, setPref } = useLiteMode()

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <Group title="Appearance">
        <SettingRow icon="sun" title="Theme" hint="Light is a warm cream; System follows your device.">
          <Segmented<ThemePref>
            label="Theme"
            value={themePref}
            onChange={setThemePref}
            options={[
              { value: 'system', label: 'System' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </SettingRow>
      </Group>

      <Group title="Sound">
        <SettingRow
          icon={soundEnabled ? 'soundOn' : 'soundOff'}
          title="Sound effects"
          hint="A chime for right and wrong answers in practice."
          control={<Switch label="Sound effects" checked={soundEnabled} onChange={(on) => on !== soundEnabled && toggleSound()} />}
        />
      </Group>

      <Group title="Performance">
        <SettingRow icon="spark" title="Lite mode" hint="No animations, glow or blur, smaller images. For older phones and Data Saver.">
          <Segmented<LitePref>
            label="Lite mode"
            value={pref}
            onChange={setPref}
            options={[
              { value: 'auto', label: 'Auto', hint: `detected: ${detected ? 'on' : 'off'}` },
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </SettingRow>
      </Group>

      {convexEnabled && (
        <Group title="Devices">
          <DevicesSetting onNavigate={onClose} />
        </Group>
      )}

      <Group title="About">
        {DEV_LINKS.map((link) => (
          <ExternalRow
            key={link.label}
            href={link.href}
            lead={
              link.icon === 'user' ? (
                <span className="flex size-9 shrink-0 items-center justify-center text-fg" aria-hidden="true">
                  <ZubyrMark size={24} />
                </span>
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-fg" aria-hidden="true">
                  <Icon name={link.icon} size={18} />
                </span>
              )
            }
            title={link.icon === 'user' ? `Built by ${DEV_NAME}` : link.hint}
            hint={link.icon === 'user' ? link.hint : link.label}
          />
        ))}
        <SettingRow icon="info" title="Version" control={<span className="font-mono text-sm font-semibold text-muted">{__APP_VERSION__}</span>} />
        <SettingRow
          icon="lock"
          title="Privacy"
          hint="No account, no ads. Your history stays on this device; only leaderboard attempts and anonymous daily visit counts are sent."
        />
      </Group>
    </Sheet>
  )
}
