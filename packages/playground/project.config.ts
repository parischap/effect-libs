import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'An Effect playground',
  dependencies: {
    '@parischap/effect-lib':
      "sourceInProd=NPM&versionInProd=^0.11.0&sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=effect-libs",
    effect: '^3.18.1',
  },
  examples: [],
  scripts: {},
  environment: 'Node',
  buildMethod: 'None',
  isPublished: false,
  hasDocGen: false,
  keywords: [],
});
