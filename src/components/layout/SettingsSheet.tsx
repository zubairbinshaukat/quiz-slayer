import type { ReactNode } from 'react'
import { useLiteMode } from '../../hooks/useLiteMode'
import { useSound } from '../../hooks/useSound'
import { useTheme } from '../../hooks/useTheme'
import { convexEnabled } from '../../lib/convex'
import type { LitePref } from '../../lib/liteMode'
import { DevicesSetting } from '../devices/DevicesSetting'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'

function SettingRow({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="py-4 first:pt-1 last:pb-1">
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

/** Appearance, sound, lite mode and device linking in one lightweight sheet (opened from the navbar gear). */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { soundEnabled, toggleSound } = useSound()
  const { pref, detected, setPref } = useLiteMode()

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="divide-y divide-line">
        <SettingRow title="Theme">
          <Segmented
            label="Theme"
            value={theme}
            onChange={(next) => next !== theme && toggleTheme()}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </SettingRow>

        <SettingRow title="Sound effects" hint="Plays a chime for right and wrong answers in practice.">
          <Segmented
            label="Sound effects"
            value={soundEnabled ? 'on' : 'off'}
            onChange={(next) => (next === 'on') !== soundEnabled && toggleSound()}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </SettingRow>

        <SettingRow
          title="Lite mode"
          hint="Turns off animations and smooth scrolling and loads smaller images. Made for older phones and Data Saver."
        >
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

        {convexEnabled && <DevicesSetting onNavigate={onClose} />}
      </div>
    </Sheet>
  )
}
