import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'A functional library to prettify Effect logging',
  dependencies: {},
  devDependencies: {},
  peerDependencies: {
    '@parischap/effect-lib': '^0.11.0',
    '@parischap/ansi-styles': '^0.2.6',
    effect: '^3.18.1',
  },
  examples: [],
  scripts: {},
  environment: 'Node',
  packageType: 'Library',
  isPublished: false,
  hasDocGen: false,
  keywords: [],
});
