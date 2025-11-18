import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'A functional library to prettify Effect logging',
  dependencies: {},
  devDependencies: {},
  peerDependencies: {
    '@parischap/effect-lib':
      "sourceInProd=NPM&versionInProd=^0.11.0&sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=effect-libs",
    '@parischap/ansi-styles':
      "sourceInProd=NPM&versionInProd=^0.2.6&sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=effect-libs",
    ...Configs.constants.effectDependencies,
  },
  examples: [],
  scripts: {},
  environment: 'Node',
  buildMethod: 'Transpile',
  isPublished: false,
  hasDocGen: false,
  keywords: [],
});
