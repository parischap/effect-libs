/** A module that implements an error that occurs when porting a function to Effect */

import { Data } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/PortError/';

/**
 * Type of a Port Error
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly originalError: unknown;
	readonly originalFunctionName: string;
	readonly moduleName: string;
	readonly libraryName: string;
}> {}
