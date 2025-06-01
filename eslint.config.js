// TODO: using .ts config file https://eslint.org/docs/head/use/configure/configuration-files#typescript-configuration-files
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {fixupConfigRules} from '@eslint/compat'
import {FlatCompat} from '@eslint/eslintrc'
import eslint from '@eslint/js'
import pluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import pluginVitest from '@vitest/eslint-plugin'
import pluginGitignore from 'eslint-config-flat-gitignore'
import {createTypeScriptImportResolver, defaultExtensions} from 'eslint-import-resolver-typescript'
import pluginDepend from 'eslint-plugin-depend'
// import {plugin as pluginExceptionHandling} from 'eslint-plugin-exception-handling'
import pluginImportX, {createNodeResolver} from 'eslint-plugin-import-x'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import pluginJsonc from 'eslint-plugin-jsonc'
import pluginNoBarrelFiles from 'eslint-plugin-no-barrel-files'
import pluginNoOnlyTests from 'eslint-plugin-no-only-tests'
import pluginNoRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import pluginNoSecrets from 'eslint-plugin-no-secrets' // TODO: Leave this functionality for another step
import pluginNoUseExtendNative from 'eslint-plugin-no-use-extend-native'
// import {configs as pluginPnpmConfigs} from 'eslint-plugin-pnpm'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginPromise from 'eslint-plugin-promise'
import * as pluginRegexp from 'eslint-plugin-regexp'
import pluginSecurity from 'eslint-plugin-security'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
// import pluginSonarjs from 'eslint-plugin-sonarjs'
import pluginTsDoc from 'eslint-plugin-tsdoc'
// import pluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
// eslint-disable-next-line import-x/no-unresolved -- import-x error
import tsEslint from 'typescript-eslint'

// eslint-plugin-unused-imports
import globs from './globs.js'
import {CAMEL_CASE} from './regexes.js'

const flatCompat = new FlatCompat({baseDirectory: path.dirname(fileURLToPath(import.meta.url))})

//------------------------------------------------------------------------------

const REACT_NATIVE = false

//------------------------------------------------------------------------------

function createApplyTo(include, exclude = []) {
  return (name, configs, enabled = true) => {
    if (!enabled) {
      return []
    }

    let config = configs

    if (Array.isArray(configs)) {
      if (configs.length > 1) {
        return configs.map((cfg, index) => ({
          ...cfg,
          name: `${name}-${index}`,
          files: include,
          ignores: exclude,
        }))
      }

      config = configs.at(0)
    }

    return [{...config, name, files: include, ignores: exclude}]
  }
}

const applyTo = {
  all: createApplyTo(globs.SCRIPT_AND_JSONS),
  script: createApplyTo(globs.SCRIPT),
  scriptNotTest: createApplyTo(globs.SCRIPT, globs.TEST),
  json: createApplyTo(globs.JSON, globs.NOT_JSON),
  jsonc: createApplyTo(globs.JSONC),
  json5: createApplyTo(globs.JSON5),
  jsonC5: createApplyTo(globs.JSONC5),
  typescript: createApplyTo(globs.TYPESCRIPT),
  react: createApplyTo(globs.REACT),
  reactHooks: createApplyTo(globs.REACT_HOOKS, globs.ROUTES),
  reactComponents: createApplyTo(globs.REACT_COMPONENTS, globs.ROUTES),
  routes: createApplyTo(globs.ROUTES),
  javascriptReact: createApplyTo(globs.REACT_JAVASCRIPT),
  typescriptReact: createApplyTo(globs.REACT_TYPESCRIPT),
  test: createApplyTo(globs.TEST, globs.TEST_2E2),
  testType: createApplyTo(globs.TEST_TYPE),
  testNotReact: createApplyTo(globs.TEST_NOT_REACT, globs.TEST_2E2),
  testReact: createApplyTo(globs.TEST_REACT, globs.TEST_2E2),
  testE2E: createApplyTo(globs.TEST_2E2),
}

//------------------------------------------------------------------------------

function getIgnoreConfigs() {
  return [
    pluginGitignore({
      root: true,
      files: ['.gitignore'],
      strict: false,
    }),
    {
      ignores: ['public/*', '**/*.gen.ts', 'vitest.config.ts.timestamp*', 'src/abis/*'],
    },
  ]
}

function getCoreConfigs() {
  return [
    ...applyTo.all('core/recommended', eslint.configs.recommended),
    ...applyTo.all('core/custom', {
      rules: {
        'camelcase': ['error', {allow: ['contract_address']}],
        'grouped-accessor-pairs': 'error',
        'accessor-pairs': 'error',
        // 'default-case': ['error', {commentPattern: '^skip\\sdefault'}],
        'default-case-last': 'error',
        // 'default-param-last': 'error',
        'no-promise-executor-return': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-useless-assignment': 'error',
        'no-await-in-loop': 'error',
        'require-atomic-updates': 'error',
        'eqeqeq': 'error',
        'func-name-matching': 'error',
        'func-names': ['error', 'as-needed'],
        'no-caller': 'error',
        'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
        'no-div-regex': 'error',
        'no-else-return': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-label-var': 'error',
        'no-implicit-coercion': ['error', {allow: ['!!', '~']}],
        'no-return-assign': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-new': 'error',
        'no-invalid-this': 'error',
        'no-implicit-globals': 'error',
        // 'no-magic-numbers': 'error',
        'no-multi-assign': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-proto': 'error',
        'no-object-constructor': 'error',
        'no-octal-escape': 'error',
        // 'no-param-reassign': 'error',
        'no-script-url': 'error',
        'no-sequences': ['error', {allowInParentheses: true}],
        // 'no-shadow': 'error',
        'no-undef-init': 'error',
        'no-unneeded-ternary': 'error',
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-bitwise': 'error',
        'no-implied-eval': 'error',
        'no-unused-expressions': 'error',
        // 'new-cap': 'error',
        'object-shorthand': 'error',
        'prefer-exponentiation-operator': 'error',
        'prefer-named-capture-group': 'error',
        'prefer-object-spread': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'prefer-object-has-own': 'error',
        'prefer-promise-reject-errors': 'error',
        'guard-for-in': 'error',
        'symbol-description': 'error',
        'yoda': 'error',
      },
    }),
    ...applyTo.all('core/security', pluginSecurity.configs.recommended),
    ...applyTo.all('core/promise', pluginPromise.configs['flat/recommended']),
    ...applyTo.all('core/promise/custom', {
      rules: {
        'promise/always-return': ['warn', {ignoreLastCallback: true}],
        'promise/no-callback-in-promise': [
          'warn',
          {exceptions: ['process.nextTick', 'setImmediate', 'setTimeout']},
        ],
      },
    }),
    ...applyTo.all('core/import-x', pluginImportX.flatConfigs.recommended),
    ...applyTo.all('core/import-x/custom', {
      settings: {
        'import-x/extensions': ['.js', '.jsx', '.cjs', '.mjs'],
        'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
        'import/resolver-next': [
          createNodeResolver({
            extensions: ['.js', ...(REACT_NATIVE ? ['.web.js', '.ios.js', '.android.js'] : [])],
          }),
        ],
        'import-x/cache': {
          lifetime: Number.POSITIVE_INFINITY,
        },
      },
      rules: {
        'import-x/no-unresolved': 'error',
        'import-x/order': 'off',
        'import-x/namespace': 'off',
        'import-x/no-mutable-exports': 'error',
        'import-x/no-cycle': [
          'warn',
          {
            ignoreExternal: true,
          },
        ],
      },
    }),
    ...applyTo.all('core/no-use-extend-native', pluginNoUseExtendNative.configs.recommended),
    ...applyTo.all('core/eslint-comments', {
      ...pluginEslintComments.configs.recommended,
      // workaround for https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215
      plugins: {'@eslint-community/eslint-comments': pluginEslintComments},
    }),
    ...applyTo.all('core/eslint-comments/custom', {
      rules: {
        '@eslint-community/eslint-comments/require-description': [
          'error',
          {ignore: ['eslint-enable']},
        ],
      },
    }),
    {
      name: 'core/eslint-comments/special',
      rules: {
        '@eslint-community/eslint-comments/disable-enable-pair': 'off',
        '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
        '@eslint-community/eslint-comments/require-description': 'off',
      },
      files: ['auto-imports.d.ts'],
    },
    ...applyTo.all('core/regexp', pluginRegexp.configs['flat/recommended']),
    ...applyTo.all(
      'core/ssr-friendly',
      fixupConfigRules(flatCompat.extends('plugin:ssr-friendly/recommended')),
    ),
    ...applyTo.all('core/depend', pluginDepend.configs['flat/recommended']),
    // TODO: enable later
    // ...applyTo.all('core/sonarjs', pluginSonarjs.configs.recommended), // drop this if using SonarQube or SonarCloud in favor of the IDE extension
    // ...applyTo.all('core/sonarjs/duplicated', {
    //   rules: {
    //     // From https://community.sonarsource.com/t/documenting-and-clarifying-duplicate-eslint-rules/129385

    //     // Duplicates no-warning-comments
    //     'sonarjs/todo-tag': 'off',
    //     // Duplicates unicorn/prefer-string-starts-ends-with
    //     'sonarjs/prefer-string-starts-ends-with': 'off',
    //     // Duplicates no-nested-ternary and unicorn/no-nested-ternary
    //     'sonarjs/no-nested-conditional': 'off',

    //     // Base ESLint rules duplications (same names)

    //     'sonarjs/default-param-last': 'off',
    //     'sonarjs/no-delete-var': 'off',
    //     'sonarjs/no-empty-function': 'off',
    //     'sonarjs/no-extend-native': 'off',
    //     'sonarjs/no-redeclare': 'off',
    //     'sonarjs/no-unreachable': 'off',
    //     'sonarjs/no-unused-expressions': 'off',
    //     'sonarjs/no-unused-private-class-members': 'off',
    //     'sonarjs/sonar-block-scoped-var': 'off',
    //     'sonarjs/sonar-max-params': 'off',
    //     'sonarjs/sonar-no-control-regex': 'off',
    //     'sonarjs/sonar-no-dupe-keys': 'off',
    //     'sonarjs/sonar-no-empty-character-class': 'off', // Also regexp/no-empty-character-class
    //     'sonarjs/sonar-no-fallthrough': 'off',
    //     'sonarjs/sonar-no-invalid-regexp': 'off', // Also regexp/no-invalid-regexp
    //     'sonarjs/sonar-no-misleading-character-class': 'off',
    //     'sonarjs/use-isnan': 'off',

    //     // eslint-plugin-autofix rules duplications (same names)

    //     'sonarjs/no-lonely-if': 'off', // Also unicorn/no-lonely-if
    //     'sonarjs/no-throw-literal': 'off',
    //     'sonarjs/no-useless-catch': 'off',
    //     'sonarjs/no-var': 'off',
    //     'sonarjs/prefer-object-spread': 'off',
    //     'sonarjs/prefer-spread': 'off', // Also unicorn/prefer-spread
    //     'sonarjs/sonar-no-regex-spaces': 'off', // Also regexp/prefer-quantifier
    //     'sonarjs/sonar-no-unused-vars': 'off',

    //     // Other regex-related duplications

    //     // Duplicates regexp/prefer-d, regexp/no-obscure-range and regexp/no-dupe-characters-character-class
    //     'sonarjs/duplicates-in-character-class': 'off',
    //     // Duplicates regexp/prefer-w, regexp/prefer-d, regexp/match-any
    //     'sonarjs/concise-regex': 'off',
    //     // Duplicates regexp/no-empty-alternative, regexp/no-trivially-nested-quantifier, regexp/no-dupe-disjunctions and regexp/no-trivially-nested-quantifier
    //     'sonarjs/empty-string-repetition': 'off',
    //     // Duplicates regexp/no-useless-character-class
    //     'sonarjs/single-char-in-character-classes': 'off',
    //     // Duplicates unicorn/better-regex and regexp/prefer-character-class
    //     'sonarjs/single-character-alternation': 'off',
    //     // Duplicates regexp/no-super-linear-move
    //     'sonarjs/slow-regex': 'off',
    //     // Duplciates regexp/prefer-regexp-exec
    //     'sonarjs/sonar-prefer-regexp-exec': 'off',
    //     // Duplicates regexp/no-empty-alternative
    //     'sonarjs/no-empty-alternatives': 'off',
    //     // Duplicates regexp/no-useless-dollar-replacements + regexp/no-unused-capturing-group
    //     'sonarjs/existing-groups': 'off',
    //     // Duplicates regexp/no-empty-capturing-group and regexp/no-empty-group
    //     'sonarjs/no-empty-group': 'off',

    //     // React/JSX-related duplications

    //     // Duplicates react/hook-use-state
    //     'sonarjs/hook-use-state': 'off',
    //     // Duplicates react/jsx-key
    //     'sonarjs/jsx-key': 'off',
    //     // Duplicated react/jsx-no-constructed-context-values
    //     'sonarjs/jsx-no-constructed-context-values': 'off',
    //     // Duplicates react/jsx-no-useless-fragment
    //     'sonarjs/jsx-no-useless-fragment': 'off',
    //     // Duplicates react/no-array-index-key
    //     'sonarjs/no-array-index-key': 'off',
    //     // Duplicates react/no-deprecated
    //     'sonarjs/no-deprecated-react': 'off',
    //     // Duplicates react/no-find-dom-node
    //     'sonarjs/no-find-dom-node': 'off',
    //     // Duplicates react/no-unknown-property
    //     'sonarjs/no-unknown-property': 'off',
    //     // Duplicates react/no-unsafe
    //     'sonarjs/no-unsafe': 'off',
    //     // Duplicates react/no-unstable-nested-components
    //     'sonarjs/no-unstable-nested-components': 'off',
    //     // Duplicates react-hooks/rules-of-hooks
    //     'sonarjs/rules-of-hooks': 'off',
    //     // Duplicates react/jsx-no-leaked-render
    //     'sonarjs/sonar-jsx-no-leaked-render': 'off',
    //     // Duplicates react/no-unused-class-component-methods
    //     'sonarjs/sonar-no-unused-class-component-methods': 'off',
    //     // Duplicates react/prefer-read-only-props
    //     'sonarjs/sonar-prefer-read-only-props': 'off',

    //     /*
    //      * SonarJS rules obsoleted by TS rules of the same name
    //      */
    //     'sonarjs/no-misused-promises': 'off',
    //     'sonarjs/no-redundant-type-constituents': 'off',
    //     'sonarjs/prefer-enum-initializers': 'off',
    //     'sonarjs/prefer-nullish-coalescing': 'off',
    //     'sonarjs/sonar-prefer-optional-chain': 'off',

    //     // Redundant in TypeScript
    //     'sonarjs/function-return-type': 'off',

    //     // [...]nobsoleted by @typescript-eslint
    //     'sonarjs/deprecation': 'off',
    //     'sonarjs/unused-import': 'off',

    //     // Redundant by some other rules
    //     'sonarjs/assertions-in-tests': 'off',
    //   },
    // }),
    // ...applyTo.all('core/sonarjs/custom', {
    //   rules: {
    //     'sonarjs/no-duplicate-string': 'warn',
    //     'sonarjs/no-nested-functions': 'warn',
    //     'sonarjs/cognitive-complexity': 'warn',
    //     'sonarjs/no-selector-parameter': 'off',
    //     'sonarjs/prefer-read-only-props': 'off',
    //     'sonarjs/no-useless-intersection': 'off',
    //     'sonarjs/no-unused-vars': 'off',
    //   },
    // }),
    // ...applyTo.all('core/sonarjs/lag', {rules: {'sonarjs/no-commented-code': 'off'}}),
    ...applyTo.all('core/no-relative-import-paths', {
      plugins: {'no-relative-import-paths': pluginNoRelativeImportPaths},
      rules: {
        'no-relative-import-paths/no-relative-import-paths': [
          'warn',
          {allowSameFolder: true, rootDir: 'src', prefix: '@'},
        ],
      },
    }),
    ...applyTo.all('core/simple-import-sort', {
      plugins: {'simple-import-sort': pluginSimpleImportSort},
      rules: {
        'sort-imports': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    }),
    ...applyTo.all('core/no-barrel-files', {
      plugins: {
        'no-barrel-files': pluginNoBarrelFiles, // switch to eslint-plugin-barrel-files?
      },
      rules: {'no-barrel-files/no-barrel-files': 'error'},
    }),
    ...applyTo.all('core/no-secrets', {
      plugins: {'no-secrets': pluginNoSecrets},
      rules: {
        'no-secrets/no-secrets': [
          'error',
          {tolerance: 4.5, ignoreContent: [new RegExp(CAMEL_CASE)]},
        ],
      },
    }),
    ...applyTo.script('core/jsdoc', pluginJsdoc.configs['flat/recommended-error']),
    ...applyTo.script('core/jsdoc/custom', {
      rules: {
        // NOTE: remove this if you are authoring a library
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/tag-lines': ['error', 'any', {startLines: 1}],
      },
    }),
    // TODO: enable for new projects
    // ...applyTo.all('core/unicorn', pluginUnicorn.configs['flat/recommended']),
    // ...applyTo.all('core/unicorn/custom', {
    //   rules: {
    //     'unicorn/better-regex': 'warn',
    //     // 'unicorn/filename-case': [
    //     //   'error',
    //     //   {
    //     //     cases: {
    //     //       kebabCase: true,
    //     //       pascalCase: true,
    //     //       camelCase: true,
    //     //     },
    //     //   },
    //     // ],
    //     'unicorn/filename-case': 'off',
    //     'unicorn/prefer-spread': 'off',
    //     'unicorn/prevent-abbreviations': 'off',
    //     'unicorn/no-null': 'off',
    //     'unicorn/no-empty-file': 'off',
    //     'unicorn/no-negated-condition': 'off',
    //     'unicorn/no-array-push-push': 'warn',
    //     'unicorn/no-array-reduce': 'warn',
    //     'unicorn/prefer-math-min-max': 'off',
    //   },
    // }),
    // TODO: investigate why this is causing issues
    // ...applyTo.all('core/exception-handling', {
    //   plugins: {
    //     'exception-handling': pluginExceptionHandling,
    //   },
    //   rules: {
    //     'exception-handling/no-unhandled': 'error',
    //     'exception-handling/might-throw': 'error',
    //     'exception-handling/use-error-cause': 'error',
    //   },
    // }),
  ]
}

function getJsonConfigs() {
  // TODO: make `eslint-plugin-jsonc` working with `@eslint/json` https://github.com/ota-meshi/eslint-plugin-jsonc#experimental-support-for-eslintjson
  return [
    ...applyTo.json('json/json', pluginJsonc.configs['flat/recommended-with-json']),
    // JSONC is just JSON with comments
    ...applyTo.jsonc('json/jsonc', pluginJsonc.configs['flat/recommended-with-jsonc']),
    // JSON5 is much more: comments, trailing commas, multi-line strings, single or double quotes, object keys without quotes, and other features borrowed from ECMAScript 5.1,...
    ...applyTo.json5('json/json5', pluginJsonc.configs['flat/recommended-with-json5']),
    ...applyTo.jsonC5('json', pluginJsonc.configs['flat/prettier']),
  ]
}

function getTypescriptConfigs() {
  return [
    ...applyTo.typescript('typescript/import-x', pluginImportX.flatConfigs.typescript),
    ...applyTo.typescript('typescript/import-x/custom', {
      settings: {
        'import-x/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts', '.mtsx', '.ctsx'],
        },
        'import/resolver-next': [
          createTypeScriptImportResolver({
            alwaysTryTypes: true,
            // bun: true,
            extensions: [...defaultExtensions, '.mts', '.cts', '.d.mts', '.d.cts', '.mjs', '.cjs'],
          }),
          createNodeResolver({
            extensions: ['.js', ...(REACT_NATIVE ? ['.web.js', '.ios.js', '.android.js'] : [])],
          }),
        ],
      },
      rules: {
        // Turn off rules that typescript already provides https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
        'import-x/named': 'off',
        'import-x/namespace': 'off',
        'import-x/default': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off',
      },
    }),
    ...applyTo.typescript('typescript/strict', tsEslint.configs.strictTypeChecked),
    ...applyTo.typescript('typescript/stylistic', tsEslint.configs.stylisticTypeChecked),
    ...applyTo.typescript('typescript', {
      languageOptions: {
        parserOptions: {
          parser: tsEslint.parser,
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        // Our own rules set
        '@typescript-eslint/consistent-type-exports': [
          'error',
          {fixMixedExportsWithInlineTypeSpecifier: false},
        ],
        '@typescript-eslint/promise-function-async': ['error'],
        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': 'error',
        '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-useless-empty-export': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            caughtErrors: 'all',
            ignoreRestSiblings: false,
            reportUsedIgnorePattern: true,
            varsIgnorePattern: '^(?!__)_.*|^_$',
            argsIgnorePattern: '^(?!__)_.*|^_$',
            caughtErrorsIgnorePattern: '^(?!__)_.*|^_$',
            destructuredArrayIgnorePattern: '^(?!__)_.*|^_$',
          },
        ],
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': [
          'error',
          {allowDefaultCaseForExhaustiveSwitch: false},
        ],
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/restrict-template-expressions': 'warn', // TODO: enable
      },
    }),
    ...applyTo.typescript('typescript/tsdoc', {
      plugins: {tsdoc: pluginTsDoc},
      rules: {'tsdoc/syntax': 'error'},
    }),
    ...applyTo.typescript(
      'typescript/jsdoc',
      pluginJsdoc.configs['flat/recommended-typescript-error'],
    ),
    ...applyTo.script('typescript/jsdoc/custom', {
      rules: {
        // NOTE: remove this if you are authoring a library
        'jsdoc/require-jsdoc': 'off',
      },
    }),
  ]
}

function getTestConfigs() {
  return [
    ...applyTo.test('testing/no-only-tests', {
      plugins: {'no-only-tests': pluginNoOnlyTests},
      rules: {'no-only-tests/no-only-tests': 'error'},
    }),
  ]
}

function getVitestConfigs() {
  return [
    ...applyTo.test('testing/vitest', {
      plugins: {vitest: pluginVitest},
      rules: {
        ...pluginVitest.configs.all.rules,
        'vitest/no-hooks': 'off',
        'vitest/max-expects': 'off',
      },
      settings: {vitest: {typecheck: true}},
      languageOptions: {globals: pluginVitest.environments.env.globals},
    }),
    ...applyTo.test(
      'testing/vitest/formatting',
      flatCompat.extends('plugin:jest-formatting/strict'),
    ),
    ...applyTo.testType('testing/vitest/type', {
      rules: {
        'vitest/prefer-expect-assertions': 'off',
      },
    }),
  ]
}

//------------------------------------------------------------------------------

export default tsEslint.config(
  ...getIgnoreConfigs(),
  ...getCoreConfigs(),
  ...getJsonConfigs(),
  ...getTypescriptConfigs(),
  ...getTestConfigs(),
  ...getVitestConfigs(),
  ...applyTo.all('settings', {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.worker,
        ...globals.serviceworker,
        ...globals.webextensions,
      },
    },
  }),
  // NOTE: enable this when using pnpm workspaces & catalogs
  // ...pluginPnpmConfigs.json,
  // ...pluginPnpmConfigs.yaml,
  ...applyTo.all('prettier', pluginPrettierRecommended), // always the last
)
