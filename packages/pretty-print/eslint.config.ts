import {
  allHtmlFiles,
  allJavaScriptFiles,
  allJson5Files,
  allJsoncFiles,
  allMdFiles,
  allSimpleJsonFiles,
  allYmlFiles,
  eslintStyleExcludeForSourceFiles,
  filesGeneratedByThirdParties,
  foldersGeneratedByThirdParties,
} from '../../../shared-utils/constants.js';
import { regExpEscape } from '../../../shared-utils/utils.js';

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

/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects. Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 */

export default defineConfig([
  // This is a global ignore, files are ignored in all other config objects
  // node_modules files and .git are also ignored.
  // Must work at all levels (top, monorepo, one-package repo, and subrepo)

  globalIgnores(
    [
      ...foldersGeneratedByThirdParties.map((folderName) => `${folderName}/`),
      ...filesGeneratedByThirdParties,
    ],
    'ignoreConfig',
  ),
  {
    files: allJavaScriptFiles,
    name: 'javascriptConfig',
    // Add html plugin so we can lint template literals inside javascript code
    plugins: { functional: functional as never, html: html as never },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      functional.configs
        .off as Config /* These rules are ts-eslint rules (not rules of the functional plugin) which the functional plugin recommends to activate because they make sense for a functional programmings style. They require typeChecking and are not cancelled by functional.configs.disableTypeChecked */,
      functional.configs.externalTypeScriptRecommended as Config,
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { impliedStrict: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'no-await-in-loop': 'error',
      'no-promise-executor-return': 'error',
      'no-useless-assignment': 'error',
      'require-atomic-updates': 'error',
      eqeqeq: 'error',

      // Enforce function names for better stack traces except for generators
      'func-names': ['error', 'as-needed', { generators: 'never' }],
      'no-throw-literal': 'error',
      'no-unused-expressions': 'error',
      'no-useless-computed-key': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-named-capture-group': 'error',
      'require-await': 'error',
      // We want to allow types and variables with same names
      'no-redeclare': 'off',

      // Useful to avoid using the `any` type
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      // We want to be able to use namespaces
      '@typescript-eslint/no-namespace': 'off',
      // We want to be able to use an empty object type in interfaces that specialize a generic type
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'functional/prefer-readonly-type': [
        'error',
        {
          allowMutableReturnType: true,
          // Effect types would not be checked anyway and makes preblems in all type declarations where tuple is used to avoid distributive conditional types
          ignoreCollections: true,
        },
      ],
      'functional/no-expression-statements': [
        'error',
        {
          ignoreCodePattern: [
            '^' + regExpEscape('describe('),
            /^this\.(?<name>[^=]+)\s*=\s*(?:[^.]+\.)?\k<name>/.source,
            '^' + regExpEscape('console.'),
            '^' + regExpEscape('super('),
            '^' + regExpEscape('expect('),
            '^' + regExpEscape('it('),
          ],
        },
      ],
      'functional/prefer-property-signatures': 'error',
      'functional/prefer-tacit': 'error',
      'functional/immutable-data': 'error',
    },
  },
  {
    files: allJavaScriptFiles,
    ignores: [eslintStyleExcludeForSourceFiles],
    name: 'javascriptConfigForNonSourceFiles',
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
  {
    files: allHtmlFiles,
    name: 'htmlConfig',
    plugins: {
      html,
    },
    extends: [(html.configs as never)['flat/recommended']],
    language: 'html/html',
    rules: {
      '@html-eslint/require-closing-tags': ['error', { selfClosing: 'always' }],
    },
  },
  {
    files: allYmlFiles,
    name: 'ymlConfig',
    extends: [eslintPluginYml.configs['flat/recommended'] as Config],

    rules: {
      'yml/no-empty-mapping-value': 'off',
    },
  },
  {
    files: allMdFiles,
    name: 'mdConfig',
    plugins: {
      markdown,
    },
    extends: ['markdown/recommended', 'markdown/processor'],
  },
  {
    files: allSimpleJsonFiles,
    ignores: ['package-lock.json'],
    name: 'simpleJsonConfig',
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: allJsoncFiles,
    name: 'jsoncConfig',
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: allJson5Files,
    name: 'json5Config',
    plugins: { json: json as never },
    language: 'json/json5',
    extends: ['json/recommended'],
  },
  // Do not specify a files directive. We want to cancel eslint rules for all types of files: *.js, *.ts, *.html...
  eslintConfigPrettier,
]) satisfies Array<Config>;
