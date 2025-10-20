import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
  description: 'A functional library to prettify Effect logging',
  dependencies: {},
  devDependencies: {},
  internalPeerDependencies: {
    'effect-lib': '^0.11.0',
    'ansi-styles': '^0.2.6',
  },
  externalPeerDependencies: {
    effect: '^3.18.1',
  },
  examples: [],
  scripts: {},
  environment: Configs.Environment.Type.Node,
  bundled: false,
  visibility: Configs.Visibility.Type.Private,
  hasDocGen: false,
  keywords: [],
});
