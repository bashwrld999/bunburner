/**
 * Destinations for the transformed files.
 */
export type RenameOutputObject = {
  /**
   * The destination path with no starting slash.
   * If not provided, the starting `src/` will be removed and `.ts` will be replaced with `.js`.
   */
  filename?: string;
  /**
   * The destination server.
   * @default 'home'
   */
  server?: string;
};
export type RenameOutput = string | RenameOutputObject | Array<string | RenameOutputObject> | null | undefined;

export interface WatchItem {
  /**
   * Glob pattern to match.
   * See {@link https://github.com/micromatch/micromatch micromatch} for more details.
   */
  pattern: string;
  bundle?: boolean;
  /**
   * Set to `true` to use `vite`'s plugins to transform the file.
   */
  transform?: boolean;
  /**
   * Set to a string to specify the server of output file.
   * Set to a {@link RenameOutputObject} to specify the output filename and server.
   * Set to a function to specify dynamically, the `file` param has no starting slash.
   * Set to or returns an array to specify multiple outputs.
   */
  location?: RenameOutput | ((file: string) => RenameOutput);
}

/**
 * User config defined in `bunburner.config`.
 */
export interface BunBurnerConfig {
  /**
   * watch options
   */
  watch?: WatchItem[];
  /**
   * The port that WebSocket server listens to.
   * @default 12525
   */
  port?: number;
  /**
   * The path to the file that contains bitburner type definitions.
   * Set to `true` to use the default filename.
   * Set to `false` to disable syncing type definitions from bitburner server.
   * @default 'NetscriptDefinitions.d.ts'
   */
  dts?: string | boolean;
}

export interface ResolvedWatchItem {
  pattern: string;
  transform: boolean;
  location: (pattern: string, file: string) => {
    filename: string;
    server: string;
  }[];
}

export interface ResolvedBunBurnerConfig {
  watch: ResolvedWatchItem[];
  port: number;
  dts?: string;
}