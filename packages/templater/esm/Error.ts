/**
 * A module that implements an error that occurs while templating
 *
 * @since 0.0.1
 */

import { Data } from 'effect';

const moduleTag = '@parischap/templater/Error/';

/**
 * Templating error
 *
 * @since 0.0.6
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly message: string;
}> {}
