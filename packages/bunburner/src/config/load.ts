import type { ParsedArgs } from 'citty';
import { loadConfig as loadConfigRaw } from 'unconfig';
import { resolveConfig } from './resolve';

export async function loadConfig(args: ParsedArgs) {
  const { config } = await loadConfigRaw({
    sources: [
      {
        files: 'bunburner.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
      },
      {
        files: 'package.json',
        extensions: [],
        rewrite(config) {
          return config?.bunburner;
        },
      },
    ],
    merge: true,
  });

  return resolveConfig({ ...config, ...args });
}
