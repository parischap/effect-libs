/** This module implements a `CVTemplatePlaceholderParser` */

import type { MInputError, MTypes } from '@parischap/effect-lib';
import type { Either } from 'effect';

/**
 * Type that describes a `CVTemplatePlaceholderParser`
 *
 * @category Models
 */
export interface Type<out T> extends MTypes.OneArgFunction<
  string,
  Either.Either<readonly [consumed: T, leftOver: string], MInputError.Type>
> {}
