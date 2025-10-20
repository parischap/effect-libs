import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
  description: 'An extension to the official Effect library',
  dependencies: {},
  devDependencies: {},
  internalPeerDependencies: {},
  externalPeerDependencies: {
    effect: '^3.18.1',
  },
  examples: [],
  scripts: {},
  environment: Configs.Environment.Type.Library,
  bundled: false,
  visibility: Configs.Visibility.Type.Public,
  hasDocGen: true,
  keywords: [],
});
