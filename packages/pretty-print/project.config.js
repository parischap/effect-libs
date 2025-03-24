import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A functional library to pretty-print and treeify objects',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: {
		'effect-lib': Configs.constants.effectLibVersion,
		'ansi-styles': Configs.constants.ansiStylesVersion
	},
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
	},
	examples: [
		'util-inspect-like.ts',
		'treeify.ts',
		'treeify-with-leaves.ts',
		'circularity-handling.ts'
	],
	scripts: {},
	environment: Configs.Environment.Type.Library,
	bundled: false,
	visibility: Configs.Visibility.Type.Public,
	hasStaticFolder: false,
	hasDocGen: true,
	keywords: [
		'inspect',
		'util.inspect',
		'object',
		'stringify',
		'pretty',
		'tree',
		'treeify',
		'print',
		'console',
		'visualize',
		'debug',
		'typescript',
		'effect'
	]
});
