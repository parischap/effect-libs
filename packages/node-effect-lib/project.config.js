import * as Configs from '@parischap/configs';
import merge from 'deepmerge';
import { basename, resolve } from 'node:path/win32';

const packageName = basename(resolve());
const repoName = basename(basename(packageName));
const packageJson = merge.all([
	Configs.packageBase(packageName, repoName),
	Configs.packageSubRepo,
	Configs.packageEffectTags,
	Configs.packageSubRepoTranspiled,
	{
		description: 'A complement to the official @effect/platform library with add-ons for Node.js',
		peerDependencies: {
			...Configs.utils.makeWorkspaceDevDep('js-lib'),
			...Configs.utils.makeWorkspaceDevDep('effect-lib'),
			'@effect/platform': Configs.constants.effectPlatformVersion,
			'@effect/platform-node': Configs.constants.effectPlatformNodeVersion,
			'@effect/schema': Configs.constants.schemaVersion,
			effect: Configs.constants.effectVersion
		}
	}
]);

export default {
	// Put prettier in first position so the next generated files will get formatted
	[Configs.constants.prettierConfigFileName]: Configs.prettierConfigTemplate,
	[Configs.constants.gitIgnoreFileName]: Configs.gitIgnore,
	[Configs.constants.prettierIgnoreFileName]: Configs.prettierIgnore,
	[Configs.constants.projectTsConfigFileName]: Configs.tsConfigSrcLibrary,
	[Configs.constants.nonProjectTsConfigFileName]: Configs.tsConfigOthers,
	[Configs.constants.tsConfigFileName]: Configs.tsConfig,
	//[Configs.constants.eslintTsConfigFileName]: Configs.tsConfigEslint,
	[Configs.constants.tscLintTsConfigFileName]: Configs.tsConfigCheck,
	[Configs.constants.licenseFileName]: Configs.licenseTemplate,
	[Configs.constants.eslintConfigFileName]: Configs.eslintConfigLibraryTemplate,
	[Configs.constants.viteConfigFileName]: 'export default {};',
	[Configs.constants.packageJsonFileName]: packageJson
};
