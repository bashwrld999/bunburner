import { defineConfig } from 'bunburner';

export default defineConfig({
  watch: [
    { pattern: 'src/servers/**/*.{js,ts}', bundle: true },
    { pattern: 'src/servers/**/*.{script,txt}' }
  ],
  // sourcemap: 'inline',
});
