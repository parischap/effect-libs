/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects. Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 */

import eslint from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
//import { importX } from 'eslint-plugin-import-x';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig, globalIgnores, type Config } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

interface ConfigArray extends ReadonlyArray<Config> {}

const javascriptPreConfig: ConfigArray = defineConfig(eslint.configs.recommended, {
  // Add no rules here because they might get overridden by the typedTypescriptConfig
  name: 'javascriptPreConfig',
  // Add html plugin so we can lint template literals inside javascript code
  plugins: { functional: functional as never, html: html as never },
  /**
   * functional.configs.strict and functional.configs.stylistic contain rules that require type
   * information. They must be deactivated for md files
   */
  extends: [functional.configs.strict as never, functional.configs.stylistic as never],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { impliedStrict: true },
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
});

const javascriptConfigForNonMdFiles: ConfigArray = defineConfig(
  // The typescript-eslint-parser requested by the functional plugin and the eslint-plugin-import-x is included in all typescript-eslint configs
  tseslint.configs.strictTypeChecked,
  {
    name: 'javascriptConfigForNonMdFiles',
    //plugins: { 'import-x': importX as never },
    extends: [
      /* These rules are ts-eslint rules (not rules of the functional plugin) which the functional plugin recommends to activate because they make sense for a functional programmings style. They require typeChecking and are not cancelled by functional.configs.disableTypeChecked */
      functional.configs.externalTypeScriptRecommended as never,
    ],
    settings: {
      /*immutability: {
        overrides: [
          {
            type: {
              from: 'lib',
              name: 'Error',
            },
            to: 'ReadonlyDeep',
          },
          {
            type: {
              from: 'lib',
              name: 'RegExp',
            },
            to: 'ReadonlyDeep',
          },
        ],
      },*/
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    /**
     * Rules that require type-information can only be modified in that config (type information is
     * unavailable in other configs)
     */
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      // call the .toString() instead if necessary
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off', // Useful to avoid using any
      //'import-x/export': 'error',
      /*'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
          peerDependencies: true,
          optionalDependencies: false,
          bundledDependencies: false,
        },
      ],*/
      'functional/immutable-data': 'error',
      /* Only activate these rules every now and again to check my work. It takes a lot of time and it triggers errors for Option's and Either's which I did not manage to silence */
      'functional/prefer-immutable-types':'off',
      'functional/type-declaration-immutability':'off',
      /*'functional/prefer-immutable-types': [
        'error',
        {
          enforcement: 'None',
          ignoreInferredTypes: true,
          parameters: {
            enforcement: 'ReadonlyDeep',
          },
          variables: {
            enforcement: 'ReadonlyDeep',
          },
        },
      ],
      'functional/type-declaration-immutability': [
        'error',
        {
          rules: [
            {
              identifiers: '^.+$',
              //Immutability is hard to reach because ReadonlyArray and Readonly tuples are not considered immutable. We
              // can easily create an override to make ReadonlyArrays immutable, but the same is not true for readonly tuples
              immutability: 'ReadonlyDeep',
              comparator: 'AtLeast',
              fixer: false,
              suggestions: false,
            },
          ],
          ignoreInterfaces: false,
        },
      ],*/
      // We keep this rule because it can catch dead code inserted to jump fast to the doc of a function
      'functional/no-expression-statements': [
        'error',
        {
          ignoreVoid: true,
          ignoreCodePattern: [],
        },
      ],
      'functional/prefer-property-signatures': 'error',
      'functional/prefer-tacit': 'error',
      'functional/functional-parameters': [
        'error',
        { allowRestParameter: true, allowArgumentsKeyword: false, enforceParameterCount: false },
      ],
      'functional/no-return-void': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-mixed-types': 'off',
      'functional/readonly-type': ['error', 'keyword'],
      // It's impossible I use a throw without being aware. Would be useful in a team to enforce a code style
      'functional/no-throw-statements': 'off',
    },
  },
);

const javascriptConfigForNonProjectNonMdFiles: ConfigArray = defineConfig({
  name: 'javascriptConfigForNonProjectNonMdFiles',
  // Here, we can mitigate rules defined in javascriptConfigForNonMdFiles specifically in non project files
  rules: {
    /*'import-x/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        peerDependencies: true,
        optionalDependencies: false,
        bundledDependencies: false,
      },
    ],*/
    // Let's allow console.log in setting files and assertions in test files
    'functional/no-expression-statements': [
      'error',
      {
        ignoreVoid: true,
        ignoreCodePattern: ["^\\x64escribe\\("],
      },
    ],
  },
});

const javascriptConfigForMdFiles: ConfigArray = defineConfig(
  /**
   * We don't perform typed checks in js files inside md files because types are usually unavailable
   * (imports are not analyzed) and there are issues with virtual **.md/*.ts files created by
   * typescript-eslint which the tsconfig file does not cover. Such files could be ignored by using
   * the allowDefaultProject property but that would slow down linting too much. See
   * typescript-eslint FAQ.
   *
   * The typescript-eslint-parser requested by the functional plugin is included in all
   * typescript-eslint configs.
   */
  tseslint.configs.strict,
  {
    name: 'javascriptConfigForMdFiles',
    // Deactivate rules that require type information that was activated in javascriptPreSetting
    extends: [functional.configs.disableTypeChecked as never],
  },
);

const javascriptConfigForNonProjectFiles: ConfigArray = defineConfig({
  name: 'javascriptConfigForNonProjectFiles',
  languageOptions: {
    globals: {
      ...globals.nodeBuiltin,
    },
  },
});
      
const javascriptConfigForProjectFiles: ConfigArray = defineConfig({
  name: 'javascriptConfigForProjectFiles',
  languageOptions: {
    globals: {
      ...globals.nodeBuiltin,
    },
  },
});

const javascriptPostConfig: ConfigArray = defineConfig({
  name: 'javascriptPostConfig',
  // Here, we mitigate rules that don't require type information
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  rules: {
    'no-redeclare': 'off', // We want to allow types and variables with same names
    '@typescript-eslint/no-namespace': 'off', // We want to be able to use namespaces
    //'@typescript-eslint/only-throw-error': 'off', // Effect has its own error management
    '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    //'codegen/codegen': 'error',
    //'sort-destructure-keys/sort-destructure-keys': 'error',
    'functional/no-this-expressions': 'off',
    'functional/no-classes': 'off',
    'functional/no-class-inheritance': 'off',
    // It's impossible I use a loop without being aware. Would be useful in a team to enforce a code style
    'functional/no-loop-statements': 'off',
    // It's impossible I use a try without being aware. Would be useful in a team to enforce a code style
    'functional/no-try-statements': 'off',
    // It's impossible I use a let without being aware. Would be useful in a team to enforce a code style
    'functional/no-let': 'off',
    // Add html rules so we can lint template literals inside javascript code
    // @ts-expect-error html.configs is defined
    ...html.configs.recommended.rules,
  },
});

const htmlConfigs: ConfigArray = defineConfig({
  name: 'htmlConfig',
  plugins: {
    html: html as never,
  },
  extends: ['html/recommended'],
  language: 'html/html',
  rules: {
    '@html-eslint/require-closing-tags': ['error', { selfClosing: 'always' }],
  },
});

const ymlConfigs: ConfigArray = defineConfig(eslintPluginYml.configs['flat/recommended'] as never, {
  name: 'ymlConfig',
  rules: {
    'yml/no-empty-mapping-value': 'off',
  },
});

const markdownConfigs: ConfigArray = defineConfig([
  {
    name: 'mdConfig',
    plugins: {
      markdown: markdown as never,
    },
    extends: ['markdown/recommended', 'markdown/processor'],
    rules: {},
  },
]);

const jsonConfigs: ConfigArray = defineConfig({
  ignores: ['package-lock.json'],
  plugins: { json: json as never },
  language: 'json/json',
  extends: ['json/recommended'],
});

const jsoncConfigs: ConfigArray = defineConfig({
  plugins: { json: json as never },
  language: 'json/jsonc',
  extends: ['json/recommended'],
});

const json5Configs: ConfigArray = defineConfig({
  plugins: { json: json as never },
  language: 'json/json5',
  extends: ['json/recommended'],
});

const scopeConfig = ({
  configs,
  files,
  ignores = [],
}: {
  readonly configs: ConfigArray;
  readonly files: ReadonlyArray<string>;
  readonly ignores?: ReadonlyArray<string>;
}) =>
  configs.map((config) => ({
    ...config,
    files: [...files],
    ignores: [...ignores],
  }));

export default defineConfig([
  // This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
  globalIgnores(
    [
      'dist/',
      'packages/',
      'projects/',
      'vite.config.ts.timestamp-*.mjs',
    ],
    'ignoreConfig',
  ),
  scopeConfig({ configs: javascriptPreConfig, files: ["**/*.ts","**/*.mts","**/*.cts","**/*.js","**/*.mjs","**/*.cjs"] }),
  scopeConfig({
    configs: javascriptConfigForNonMdFiles,
    files: ["**/*.ts","**/*.mts","**/*.cts","**/*.js","**/*.mjs","**/*.cjs"],
    ignores: ["**/*.md/*.ts","**/*.md/*.mts","**/*.md/*.cts","**/*.md/*.js","**/*.md/*.mjs","**/*.md/*.cjs"],
  }),
  scopeConfig({
    configs: javascriptConfigForNonProjectNonMdFiles,
    files: ["**/*.ts","**/*.mts","**/*.cts","**/*.js","**/*.mjs","**/*.cjs"],
    ignores: ["esm/**","**/*.md/*.ts","**/*.md/*.mts","**/*.md/*.cts","**/*.md/*.js","**/*.md/*.mjs","**/*.md/*.cjs"],
  }),
  scopeConfig({ configs: javascriptConfigForMdFiles, files: ["**/*.md/*.ts","**/*.md/*.mts","**/*.md/*.cts","**/*.md/*.js","**/*.md/*.mjs","**/*.md/*.cjs"] }),
  scopeConfig({
    configs: javascriptConfigForNonProjectFiles,
    files: ["**/*.ts","**/*.mts","**/*.cts","**/*.js","**/*.mjs","**/*.cjs"],
    ignores: ["esm/**"],
  }),
  scopeConfig({
    configs: javascriptConfigForProjectFiles,
    files: ["esm/**/*.ts","esm/**/*.mts","esm/**/*.cts","esm/**/*.js","esm/**/*.mjs","esm/**/*.cjs"],
  }),
  scopeConfig({ configs: javascriptPostConfig, files: ["**/*.ts","**/*.mts","**/*.cts","**/*.js","**/*.mjs","**/*.cjs"] }),
  scopeConfig({ configs: htmlConfigs, files: ["**/*.html","**/*.htm"] }),
  scopeConfig({ configs: ymlConfigs, files: ["**/*.yml","**/*.yaml"] }),
  scopeConfig({ configs: markdownConfigs, files: ["**/*.md"] }),
  scopeConfig({ configs: jsonConfigs, files: ["**/*.json"] }),
  scopeConfig({ configs: jsoncConfigs, files: ["**/*.jsonc"] }),
  scopeConfig({ configs: json5Configs, files: ["**/*.json5"] }),
  // Do not specify a files directive. We want to cancel eslint rules for all types of files: *.js, *.ts, *.html...
  eslintConfigPrettier,
]);