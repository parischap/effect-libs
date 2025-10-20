import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
  description: 'A functional library to pretty-print and treeify objects',
  dependencies: {},
  devDependencies: {},
  internalPeerDependencies: {
    'effect-lib': '^0.11.0',
    'ansi-styles': '^0.2.6',
  },
  externalPeerDependencies: {
    effect: '^3.18.1',
  },
  examples: [
    'util-inspect-like.ts',
    'treeify.ts',
    'treeify-with-leaves.ts',
    'circularity-handling.ts',
  ],
  scripts: {},
  environment: Configs.Environment.Type.Library,
  bundled: false,
  visibility: Configs.Visibility.Type.Public,
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
