import * as Configs from '@parischap/configs';
import { merge } from 'ts-deepmerge';

export default merge(
	Configs.configSubRepo({
		environment: Configs.Environment.Type.Library,
		bundled: false,
		visibility: Configs.Visibility.Type.Public,
		hasStaticFolder: false,
		hasDocGen: true,
		keywords: [
			'inspect',
			'util.inspect',
			'object',
			'stringify',
			'pretty',
			'tree',
			'treeify',
			'print',
			'console',
			'visualize',
			'debug',
			'typescript',
			'effect'
		]
	}),
	{
		[Configs.constants.packageJsonFileName]: {
			description: 'A functional library to pretty-print and treeify objects',
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
			scripts: {
				examples:
					'vite-node examples/uncolored-tabified.ts && vite-node examples/ansi-dark-tabified.ts && vite-node examples/ansi-dark-treeified.ts && vite-node examples/date-as-object-or-value.ts && vite-node examples/show-prototype.ts'
			}
		}
	}
);
