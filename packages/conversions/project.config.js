import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Library,
		bundled: false,
		visibility: Configs.Visibility.Type.Public,
		hasStaticFolder: false,
		hasDocGen: true,
		keywords: ['number', 'text', 'conversion', 'n2t', 'num2text', 'convert', 'typescript', 'effect']
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'A functional library to convert number and dates to string and vice-versa',
			peerDependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				effect: Configs.constants.effectVersion
			},
			publishConfig: {
				peerDependencies: {
					[`${Configs.constants.scope}/effect-lib`]: '^0.5.0',
					effect: Configs.constants.effectVersion
				}
			},
			scripts: {
				examples: 'vite-node examples/stupid.ts'
			}
		}
	}
);
