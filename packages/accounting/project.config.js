import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Node,
		bundled: true,
		visibility: Configs.Visibility.Type.Private,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'Small app to prepare LGDP accounting entries',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.4.0'
				}
			},
			scripts: {}
		}
	}
);
