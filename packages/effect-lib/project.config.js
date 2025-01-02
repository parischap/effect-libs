import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Library,
		bundled: false,
		visibility: Configs.Visibility.Type.Public,
		hasStaticFolder: false,
		hasDocGen: true,
		keywords: []
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'An extension to the official Effect library',
			peerDependencies: {
				effect: Configs.constants.effectVersion
			}
		}
	}
);
