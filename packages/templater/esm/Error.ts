/** A module that implements an error that occurs while templating */

import { Data } from 'effect';

const moduleTag = '@parischap/templater/Error/';

/**
 * Templating error
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly message: string;
}> {}
