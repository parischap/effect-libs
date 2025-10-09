import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A playground',
	environment: Configs.Environment.Type.Node,
	dependencies: {
		effect: '^3.18.1',
		'@parischap/effect-lib': '^0.11.0',
		'@parischap/ansi-styles': '^0.2.6'
		//'@parischap/conversions': Configs.constants.'^0.8.0'
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
