/** This module implements a `CVTemplatePlaceholderFormatter`(see `CVTemplatePlaceholder`) */
import * as MInputError from '@parischap/effect-lib/MInputError'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Either from 'effect/Either'

/**
 * Type that describes a `CVTemplatePlaceholderFormatter`
 *
 * @category Models
 */
export interface Type<in T> extends MTypes.OneArgFunction<
  T,
  Either.Either<string, MInputError.Type>
> {}
