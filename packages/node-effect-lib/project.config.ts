import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'A complement to the official @effect/platform library with add-ons for Node.js',
  peerDependencies: {
    '@parischap/effect-lib':
      "sourceInProd=NPM&versionInProd=^0.11.0&sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=effect-libs",
    ...Configs.constants.effectDependencies,
    ...Configs.constants.effectPlatformDependencies,
  },
  examples: [],
  scripts: {},
  environment: 'Node',
  buildMethod: 'Transpile',
  isPublished: false,
  hasDocGen: false,
  keywords: [],
});
