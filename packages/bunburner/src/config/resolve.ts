import type {
  BunBurnerConfig,
  ResolvedBunBurnerConfig,
  WatchItem,
} from '../types';

export const defaultUploadLocation = (file: string) => {
  return file.replace(/^src\//, '').replace(/\.ts$/, '.js');
};

/** Enforce starting slash */
export const forceStartingSlash = (s: string) => {
  return s.startsWith('/') ? s : `/${s}`;
};

/** Enforce starting slash if file is not in root dir */
export const fixStartingSlash = (s: string) => {
  const index = s.lastIndexOf('/');
  if (index === 0) {
    // if file is in root dir with starting slash, remove it
    return s.substring(1);
  }
  if (index !== -1) {
    // if file is not in root dir, add starting slash
    return forceStartingSlash(s);
  }
  // if file is in root dir without starting slash, keep it as-is
  return s;
};

export function resolveWatchLocation(location: WatchItem['location']) {
  return (pattern: string, filename: string) => {
    const remove = pattern.match(/([\w\/]+)\*/)?.[1] ?? '';
    const server = filename.replace(remove, '').split('/')[0];
    const defaultFilenameArray = filename.replace(remove, '').split('/');
    defaultFilenameArray.shift();
    const defaultFilename = defaultFilenameArray.join('/')
    let result = location ?? server ?? 'home';
    if (typeof result === 'function') {
      const resolved = result(filename);
      if (!resolved) {
        return [];
      }
      result = resolved;
    }
    if (!Array.isArray(result)) {
      result = [result];
    }
    return result.map((r) => {
      const itemResult = {
        filename: defaultFilename,
        server: 'home',
        ...(typeof r === 'string' ? { server: r } : r),
      };
      itemResult.filename // = fixStartingSlash(itemResult.filename);
      return itemResult;
    });
  };
}

export function resolveDts(dts: BunBurnerConfig['dts']) {
  if (typeof dts === 'string') {
    return dts;
  }
  if (dts === false) {
    return undefined;
  }
  return 'NetscriptDefinitions.d.ts';
}

export function resolveConfig(config: BunBurnerConfig) {
  const watch = config.watch ?? [];

  if (typeof config.port === 'string') config.port = Number(config.port);

  const resolvedConfig: ResolvedBunBurnerConfig = {
    watch: watch.map((item) => ({
      pattern: item.pattern,
      bundle: item.bundle ?? false,
      transform: item.transform ?? false,
      location: resolveWatchLocation(item.location),
    })),
    // ...resolvePolling(config.usePolling),
    // sourcemap: config.sourcemap ?? false,
    port: config.port ?? 12525,
    // timeout: config.timeout ?? 10000,
    dts: resolveDts(config.dts),
    // ignoreInitial: config.ignoreInitial ?? false,
    // download: {
    //   server: Array.isArray(server) ? server : [server],
    //   location: config?.download?.location ?? ((file) => 'src/' + file),
    //   ignoreTs: config?.download?.ignoreTs ?? true,
    //   ignoreSourcemap: config?.download?.ignoreSourcemap ?? true,
    // },
    // dumpFiles: resolveDumpFile(config.dumpFiles),
    // cwd: config.cwd ?? process.cwd(),
  };
  return resolvedConfig;
}
