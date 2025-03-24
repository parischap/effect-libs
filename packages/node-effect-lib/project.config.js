import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A complement to the official @effect/platform library with add-ons for Node.js',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: { 'effect-lib': Configs.constants.effectLibVersion },
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion,
		'@effect/platform': Configs.constants.effectPlatformVersion,
		'@effect/platform-node': Configs.constants.effectPlatformNodeVersion
	},
	examples: [],
	scripts: {},
	environment: Configs.Environment.Type.Library,
	bundled: false,
	visibility: Configs.Visibility.Type.Public,
	hasStaticFolder: false,
	hasDocGen: false,
	keywords: []
});
