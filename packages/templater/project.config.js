import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description:
		'A functional library to read from (PHP sscanf equivalent) and write to (PHP sprintf equivalent) a string with type checking',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: { 'effect-lib': Configs.constants.effectLibVersion },
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
	},
	examples: ['stupid.ts'],
	scripts: {},
	environment: Configs.Environment.Type.Library,
	bundled: false,
	visibility: Configs.Visibility.Type.Public,
	hasStaticFolder: false,
	hasDocGen: false,
	keywords: [
		'printf',
		'sprintf',
		'sscanf',
		'template',
		'format',
		'templater',
		'typescript',
		'effect'
	]
});
