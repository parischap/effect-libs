import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A complement to the official effect library dedicated to date and time',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: { 'effect-lib': Configs.constants.effectLibVersion },
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
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
