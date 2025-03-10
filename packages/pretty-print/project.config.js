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
					[`${Configs.constants.scope}/effect-lib`]: '^0.5.0',
					[`${Configs.constants.scope}/ansi-styles`]: '^0.0.1',
					effect: Configs.constants.effectVersion
				}
			},
			scripts: {
				examples:
					'vite-node examples/util-inspect-like.ts && vite-node examples/treeify.ts && vite-node examples/treeify-with-leaves.ts && vite-node examples/circularity-handling.ts'
			}
		}
	}
);
