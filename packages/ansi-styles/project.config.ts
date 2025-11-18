import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'A functional library to style your strings in terminals',
  dependencies: {},
  devDependencies: {},
  peerDependencies: {
    '@parischap/effect-lib':
      "sourceInProd=NPM&versionInProd=^0.11.0&sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=effect-libs",
    ...Configs.constants.effectDependencies,
  },
  examples: ['basic-usage.ts', 'cancelling-a-style.ts', 'simple-colors.ts', 'all-colors.ts'],
  scripts: {},
  environment: 'Library',
  buildMethod: 'Transpile',
  isPublished: true,
  hasDocGen: true,
  keywords: [
    'terminal',
    'color',
    'colour',
    'colors',
    'formatting',
    'cli',
    'console',
    'string',
    'ansi',
    'style',
    'styles',
    'tty',
    'formatting',
    'rgb256',
    'shell',
    'xterm',
    'log',
    'logging',
    'command-line',
    'text',
  ],
});
