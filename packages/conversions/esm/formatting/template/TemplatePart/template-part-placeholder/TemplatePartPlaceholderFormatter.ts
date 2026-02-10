/** This module implements a `CVTemplatePartPlaceholderFormatter`(see `CVTemplatePartPlaceholder`) */
import type { MInputError, MTypes } from '@parischap/effect-lib';
import type { Either } from 'effect';

/**
 * Type that describes a `CVTemplatePartPlaceholderFormatter`
 *
 * @category Models
 */
export interface Type<in T> extends MTypes.OneArgFunction<
  T,
  Either.Either<string, MInputError.Type>
> {}
