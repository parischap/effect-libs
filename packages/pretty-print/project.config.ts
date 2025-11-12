import * as Configs from '@parischap/configs';
import { basename, dirname } from 'path';

export default Configs.configSubRepo({
  repoName: basename(dirname(dirname(import.meta.dirname))),
  packageName: basename(import.meta.dirname),
  description: 'A functional library to pretty-print and treeify objects',
  peerDependencies: {
    '@parischap/effect-lib': '^0.11.0',
    '@parischap/ansi-styles': '^0.2.6',
    effect: '^3.18.1',
  },
  examples: [
    'util-inspect-like.ts',
    'treeify.ts',
    'treeify-with-leaves.ts',
    'circularity-handling.ts',
  ],
  scripts: {},
  environment: 'Library',
  packageType: 'Library',
  isPublished: true,
  hasDocGen: true,
  keywords: [
    'inspect',
    'util.inspect',
    'object',
    'stringify',
    'pretty',
    'tree',
    'treeify',
    'print',
    'console',
    'visualize',
    'debug',
    'typescript',
    'effect',
  ],
});
