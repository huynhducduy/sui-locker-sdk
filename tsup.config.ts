import {defineConfig} from 'tsup'

export default defineConfig(options => ({
  entry: [
    'src/**/*.ts',
    '!**/*.d.ts',
    '!src/scripts/**/*',
    '!src/setupTest.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test-d.ts',
  ],
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  minify: !options.watch,
  dts: true,
  metafile: true,
  format: ['esm'],
  // shims: true,
}))
