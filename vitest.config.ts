/// <reference types="vitest" />
import os from 'os'
import {coverageConfigDefaults, defineConfig, mergeConfig} from 'vitest/config'

// import viteConfig from './vite.config'

export default defineConfig(_configEnv =>
  mergeConfig(
    {}, // viteConfig(configEnv),
    defineConfig({
      test: {
        maxConcurrency: os.availableParallelism(),
        isolate: false,
        css: false,
        passWithNoTests: true,
        globals: true,
        unstubGlobals: true,
        environment: 'node',
        environmentMatchGlobs: [
          ['**/*.{test,spec}?(-d).?(c|m)[jt]s', 'node'],
          ['**/__tests__/**/*.?(c|m)[jt]s?(x)', 'node'],
        ],
        setupFiles: 'src/setupTest.ts',
        typecheck: {
          enabled: true,
          ignoreSourceErrors: true,
        },
        coverage: {
          enabled: false,
          // provider: 'istanbul', // Switch back to istanbul instead of native v8? https://www.thecandidstartup.org/2024/03/18/vitest-code-coverage.html
          clean: true,
          cleanOnRerun: true,
          skipFull: true,
          reporter: ['text', 'html', 'clover', 'json'],
          // thresholds: {
          //   lines: 75,
          //   functions: 75,
          //   branches: 75,
          //   statements: 75,
          //   perFile: true,
          //   autoUpdate: true,
          // },
          include: ['src/**/*'],
          exclude: ['src/setupTest.ts', ...coverageConfigDefaults.exclude],
        },
      },
    }),
  ),
)
