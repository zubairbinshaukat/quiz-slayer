/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

/** package.json version, injected by vite.config.ts `define`. */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
