/** A module that implements an error that occurs while Effectifying a function */

import { Data } from 'effect';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/PortError/';

/**
 * FunctionPort signals an error that occurs while Effectifying a function
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly originalError: unknown;
	readonly originalFunctionName: string;
	readonly moduleName: string;
	readonly libraryName: string;
}> {}
