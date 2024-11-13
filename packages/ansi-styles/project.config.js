import * as Configs from '@parischap/configs';
import merge from 'deepmerge';
import { basename, dirname, resolve } from 'node:path';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));
const packageJson = merge.all([
	// Put it in first position so specific keywords come out first
	{
		description:
			'A simple library to format your console outputs using ANSI escape sequences defined in the Select Graphic Rendition subset (colors and other formatting sequences) ',
		peerDependencies: {
			...Configs.utils.makeWorkspaceDevDep('effect-lib'),
			effect: Configs.constants.effectVersion
		},
		devDependencies: {
			[`${Configs.constants.scope}/${packageName}`]: 'link:.'
		},
		publishConfig: {
			peerDependencies: {
				[`${Configs.constants.scope}/effect-lib`]: '^0.4.0'
			}
		},
		scripts: {
			examples: 'vite-node examples/example1.ts'
		},
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
	},
	Configs.packageBase(packageName, repoName),
	Configs.packageSubRepo,
	Configs.packageSubRepoTranspiled,
	Configs.packageSubRepoTranspiledEffect,
	Configs.packageSubRepoPublic
]);

export default {
	// Put prettier in first position so the next generated files will get formatted
	[Configs.constants.prettierConfigFileName]: Configs.prettierConfigTemplate,
	[Configs.constants.docgenConfigFileName]: Configs.docgenConfig,
	[Configs.constants.gitIgnoreFileName]: Configs.gitIgnoreTemplate,
	[Configs.constants.madgeConfigFileName]: Configs.madgercTemplate,
	[Configs.constants.prettierIgnoreFileName]: Configs.prettierIgnore,
	[Configs.constants.baseTsConfigFileName]: Configs.tsConfigBase,
	[Configs.constants.projectTsConfigFileName]: Configs.tsConfigSrcLibrary,
	[Configs.constants.nonProjectTsConfigFileName]: Configs.tsConfigOthers,
	[Configs.constants.tsConfigFileName]: Configs.tsConfig,
	[Configs.constants.tscLintTsConfigFileName]: Configs.tsConfigCheck,
	[Configs.constants.docgenTsConfigFileName]: Configs.tsconfigDocgen,
	[Configs.constants.licenseFileName]: Configs.licenseTemplate,
	[Configs.constants.eslintConfigFileName]: Configs.eslintConfigLibraryTemplate,
	[Configs.constants.viteConfigFileName]: 'export default {};',
	[Configs.constants.packageJsonFileName]: packageJson
};
