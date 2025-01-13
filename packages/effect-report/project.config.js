import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Node,
		bundled: false,
		visibility: Configs.Visibility.Type.Private,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'A functional library to prettify Effect logging',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				...Configs.utils.devWorkspaceLink('ansi-styles'),
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.4.0',
					[`${Configs.constants.scope}/ansi-styles`]: '^0.0.1'
				}
			},
			scripts: {}
		}
	}
);
