/** This module implements a `CVTemplatePlaceholderParser` */

import * as MInputError from '@parischap/effect-lib/MInputError'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Either from 'effect/Either'

/**
 * Type that describes a `CVTemplatePlaceholderParser`
 *
 * @category Models
 */
export interface Type<out T> extends MTypes.OneArgFunction<
  string,
  Either.Either<readonly [consumed: T, leftOver: string], MInputError.Type>
> {}
