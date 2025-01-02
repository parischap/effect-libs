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
			description: 'Playground',
			dependencies: {
				...Configs.utils.devWorkspaceLink('effect-lib'),
				effect: Configs.constants.effectVersion
			},
			scripts: {
				play: 'vite-node esm/index.ts'
			}
		}
	}
);
