import { eslintStyleIncludeForSourceFiles } from '../../../shared-utils/constants.js';

//import { importX } from 'eslint-plugin-import-x';
import { defineConfig, type Config } from 'eslint/config';
import globals from 'globals';
import EslintConfigBase from './eslint.config.base.template.js';

export default defineConfig([
  ...EslintConfigBase,
  {
    files: eslintStyleIncludeForSourceFiles,
    name: 'javascriptConfigSourceFiles',
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
]) satisfies Array<Config>;
