import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
  description: 'A complement to the official @effect/platform library with add-ons for Node.js',
  dependencies: {},
  devDependencies: {},
  internalPeerDependencies: { 'effect-lib': '^0.11.0' },
  externalPeerDependencies: {
    effect: '^3.18.1',
    '@effect/platform': '^0.92.1',
    '@effect/platform-node': '^0.98.3',
  },
  examples: [],
  scripts: {},
  environment: Configs.Environment.Type.Library,
  bundled: false,
  visibility: Configs.Visibility.Type.Public,
  hasDocGen: false,
  keywords: [],
});
