import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'An extension to the official Effect library',
  peerDependencies: Configs.constants.effectDependencies,
  examples: [],
  scripts: {},
  environment: 'Library',
  buildMethod: 'Transpile',
  isPublished: true,
  hasDocGen: true,
  keywords: [],
});
