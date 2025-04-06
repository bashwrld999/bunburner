import type { BunBurnerConfig } from './types'
import type { MaybePromise } from './utils'

export type { BunBurnerConfig }

export const defineConfig = (
  options:
    | BunBurnerConfig
    | BunBurnerConfig[]
    | ((
        /** The options derived from CLI flags */
        overrideOptions: BunBurnerConfig,
      ) => MaybePromise<BunBurnerConfig | BunBurnerConfig[]>),
) => options