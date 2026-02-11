/** This module implements a `CVTemplatePlaceholderFormatter`(see `CVTemplatePlaceholder`) */
import type { MInputError, MTypes } from '@parischap/effect-lib';
import type { Either } from 'effect';

/**
 * Type that describes a `CVTemplatePlaceholderFormatter`
 *
 * @category Models
 */
export interface Type<in T> extends MTypes.OneArgFunction<
  T,
  Either.Either<string, MInputError.Type>
> {}
