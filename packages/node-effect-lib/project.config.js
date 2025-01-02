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
			description: 'A complement to the official @effect/platform library with add-ons for Node.js',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				'@effect/platform': Configs.constants.effectPlatformVersion,
				'@effect/platform-node': Configs.constants.effectPlatformNodeVersion,
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.4.0'
				}
			}
		}
	}
);
