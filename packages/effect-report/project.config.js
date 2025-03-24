import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A functional library to prettify Effect logging',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: {
		'effect-lib': Configs.constants.effectLibVersion,
		'ansi-styles': Configs.constants.ansiStylesVersion
	},
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
	},
	examples: [],
	scripts: {},
	environment: Configs.Environment.Type.Node,
	bundled: false,
	visibility: Configs.Visibility.Type.Private,
	hasStaticFolder: false,
	hasDocGen: false,
	keywords: []
});
