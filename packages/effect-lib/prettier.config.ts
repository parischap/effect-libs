import type { Config } from 'prettier';
/* eslint-disable-next-line functional/prefer-immutable-types */
const _default: Config = {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-jsdoc'],
};

export default _default;