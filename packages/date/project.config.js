import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Library,
		bundled: false,
		visibility: Configs.Visibility.Type.Public,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'A complement to the official effect library dedicated to date and time',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				...Configs.utils.devWorkspaceLink('templater'),
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.4.0',
					[`${Configs.constants.scope}/templater`]: '^0.0.1'
				}
			}
		}
	}
);
