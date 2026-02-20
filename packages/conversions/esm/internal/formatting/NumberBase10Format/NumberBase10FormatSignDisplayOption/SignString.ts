/** Module that implements a type that represents the possible strings used to represent a sign */

import * as MPredicate from '@parischap/effect-lib/MPredicate'
import * as Predicate from 'effect/Predicate'

/**
 * Type of a CVSignString
 *
 * @category Models
 */
export type Type = '-' | '+' | '';

export const isPlusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('+');
export const isMinusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('-');
