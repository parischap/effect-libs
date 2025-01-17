/**
 * A module that implements an error that occurs while Effectifying a function
 *
 * @since 0.0.6
 */

import { Data } from 'effect';

/**
 * Module tag
 *
 * @since 0.5.0
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/PortError/';

/**
 * FunctionPort signals an error that occurs while Effectifying a function
 *
 * @since 0.0.6
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly originalError: unknown;
	readonly originalFunctionName: string;
	readonly moduleName: string;
	readonly libraryName: string;
}> {}
