import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
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
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description:
				'A functional library to read from (PHP sscanf equivalent) and write to (PHP sprintf equivalent) a string with type checking',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.4.0'
				}
			},
			scripts: {
				examples: 'vite-node examples/stupid.ts'
			}
		}
	}
);
