import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A playground',
	environment: Configs.Environment.Type.Library,
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: {},
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion,
		'@parischap/effect-lib': Configs.constants.effectLibVersion,
		'@parischap/conversions': Configs.constants.conversionsVersion
	},
	examples: ['playground.ts'],
	scripts: {},
	bundled: true,
	visibility: Configs.Visibility.Type.Private,
	hasStaticFolder: false,
	hasDocGen: false,
	keywords: []
});
