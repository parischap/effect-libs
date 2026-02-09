/** This module implements a CVPlaceholderFormatter */
import type { MInputError, MTypes } from '@parischap/effect-lib';
import type { Either } from 'effect';

/**
 * Type that describes a CVPlaceholderFormatter
 *
 * @category Models
 */
export interface Type<in T> extends MTypes.OneArgFunction<
  T,
  Either.Either<string, MInputError.Type>
> {}
