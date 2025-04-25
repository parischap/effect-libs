/** A module that implements diverse errors */

import { Data } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/effect-lib/Error/';

/**
 * Namespace for errors that occurs while Effectifying a function
 *
 * @category Models
 */
export namespace EffectPort {
	const _namespaceTag = moduleTag + 'EffectPort/';

	/**
	 * Type of an EffectPort Error
	 *
	 * @category Models
	 */
	export class Type extends Data.TaggedError(_namespaceTag)<{
		readonly originalError: unknown;
		readonly originalFunctionName: string;
		readonly moduleName: string;
		readonly libraryName: string;
	}> {}
}

/**
 * Namespace for errors that signal incorrect input
 *
 * @category Models
 */
export namespace Input {
	const _namespaceTag = moduleTag + 'Input/';

	/**
	 * Type of an Input Error
	 *
	 * @category Models
	 */
	export class Type extends Data.TaggedError(_namespaceTag)<{
		readonly message: string;
	}> {}
}
