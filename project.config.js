import * as Configs from '@parischap/configs';
import merge from 'deepmerge';
import { basename, resolve } from 'node:path';

const packageName = basename(resolve());
const packageJson = merge.all([
	Configs.packageBase(packageName, packageName),
	Configs.packageMonoRepo,
	Configs.packageTop,
	{
		description: 'Top repository of monorepo'
	}
]);

export default {
	// Put prettier in first position so the next generated files will get formatted
	[Configs.constants.prettierConfigFileName]: Configs.prettierConfigTemplate,
	[Configs.constants.docgenConfigFileName]: Configs.docgenConfig,
	[Configs.constants.gitIgnoreFileName]: Configs.gitIgnoreTemplate,
	[Configs.constants.prettierIgnoreFileName]: Configs.prettierIgnore,
	[Configs.constants.baseTsConfigFileName]: Configs.tsConfigBase,
	[Configs.constants.projectTsConfigFileName]: Configs.tsConfigSrcNode,
	[Configs.constants.nonProjectTsConfigFileName]: Configs.tsConfigOthers,
	[Configs.constants.tsConfigFileName]: Configs.tsConfig,
	[Configs.constants.tscLintTsConfigFileName]: Configs.tsConfigCheck,
	[Configs.constants.eslintConfigFileName]: Configs.eslintConfigNodeTemplate,
	[Configs.constants.viteConfigFileName]: 'export default {};',
	[Configs.constants.packageJsonFileName]: packageJson,
	[Configs.constants.vitestWorkspaceFileName]: Configs.vitestWorkspaceTemplate,
	[Configs.constants.licenseFileName]: Configs.licenseTemplate,
	[Configs.constants.pnpmWorkspaceFileName]: Configs.pnpmWorkspaceTemplate,
	[`${Configs.constants.githubFolderName}/${Configs.constants.workflowsFolderName}/publish.yml`]:
		Configs.githubWorkflowsPublishTemplate,
	[`${Configs.constants.githubFolderName}/${Configs.constants.workflowsFolderName}/publish-debug.yml`]:
		Configs.githubWorkflowsPublishDebugTemplate,
	[`${Configs.constants.githubFolderName}/${Configs.constants.workflowsFolderName}/pages.yml`]:
		Configs.githubWorkflowsPagesTemplate
};
