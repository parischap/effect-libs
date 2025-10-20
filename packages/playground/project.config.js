import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
  description: 'A playground',
  environment: Configs.Environment.Type.Node,
  dependencies: {
    effect: '^3.18.1',
    '@effect/platform': '^0.92.1',
    '@effect/platform-node': '^0.98.3',
    '@effect/cluster': '^0.50.3',
    '@effect/rpc': '^0.71.0',
    '@effect/sql': '^0.46.0',
    '@effect/workflow': '^0.11.3',
  },
  devDependencies: {},
  internalPeerDependencies: {},
  externalPeerDependencies: {},
  examples: ['playground.ts'],
  scripts: {},
  bundled: true,
  visibility: Configs.Visibility.Type.Private,
  hasDocGen: false,
  keywords: [],
});
