import * as Configs from '@parischap/configs';
import merge from 'deepmerge';
import { basename, dirname, resolve } from 'node:path';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));
const packageJson = merge.all([
	Configs.packageBase(packageName, repoName),
	Configs.packageSubRepo,
	Configs.packageSubRepoTranspiled,
	Configs.packageSubRepoTranspiledEffect,
	Configs.packageSubRepoPublic,
	{
		description: 'A functional library to pretty-print and treeify objects',
		peerDependencies: {
			...Configs.utils.makeWorkspaceDevDep('js-lib'),
			...Configs.utils.makeWorkspaceDevDep('effect-lib'),
			effect: Configs.constants.effectVersion
		},
		devDependencies: {
			[`${Configs.constants.scope}/${packageName}`]: 'link:.'
		},
		publishConfig: {
			peerDependencies: {
				[`${Configs.constants.scope}/js-lib`]: '^0.0.5',
				[`${Configs.constants.scope}/effect-lib`]: '^0.0.6'
			}
		},
		scripts: {
			examples:
				'vite-node examples/uncolored-tabified.ts && vite-node examples/ansi-dark-tabified.ts && vite-node examples/ansi-dark-treeified.ts'
		}
	}
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
