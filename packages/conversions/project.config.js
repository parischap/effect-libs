import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A functional library to convert number and dates to string and vice-versa',
	environment: Configs.Environment.Type.Library,
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: { 'effect-lib': Configs.constants.effectLibVersion },
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
	},
	examples: ['perf.ts'],
	scripts: {},
	bundled: false,
	visibility: Configs.Visibility.Type.Public,
	hasStaticFolder: false,
	hasDocGen: true,
	keywords: ['number', 'text', 'conversion', 'n2t', 'num2text', 'convert', 'typescript', 'effect']
});
