import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A playground',
	environment: Configs.Environment.Type.Node,
	dependencies: {
		effect: Configs.constants.effectVersion,
		'@parischap/effect-lib': Configs.constants.effectLibVersion,
		'@parischap/ansi-styles': Configs.constants.ansiStylesVersion
		//'@parischap/conversions': Configs.constants.conversionsVersion
	},
	devDependencies: {},
	internalPeerDependencies: {},
	externalPeerDependencies: {},
	examples: ['playground.ts'],
	scripts: {},
	bundled: true,
	visibility: Configs.Visibility.Type.Private,
	hasStaticFolder: false,
	hasDocGen: false,
	keywords: []
});
