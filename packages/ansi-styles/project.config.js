import * as Configs from '@parischap/configs';

export default Configs.configSubRepo({
	description: 'A functional library to style your strings in terminals',
	dependencies: {},
	devDependencies: {},
	internalPeerDependencies: { 'effect-lib': Configs.constants.effectLibVersion },
	externalPeerDependencies: {
		effect: Configs.constants.effectVersion
	},
	examples: ['basic-usage.ts', 'cancelling-a-style.ts', 'simple-colors.ts', 'all-colors.ts'],
	scripts: {},
	environment: Configs.Environment.Type.Library,
	bundled: false,
	visibility: Configs.Visibility.Type.Public,
	hasStaticFolder: false,
	hasDocGen: true,
	keywords: [
		'terminal',
		'color',
		'colour',
		'colors',
		'formatting',
		'cli',
		'console',
		'string',
		'ansi',
		'style',
		'styles',
		'tty',
		'formatting',
		'rgb256',
		'shell',
		'xterm',
		'log',
		'logging',
		'command-line',
		'text'
	]
});
