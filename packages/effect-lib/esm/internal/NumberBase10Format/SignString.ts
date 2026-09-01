/** Module that implements a type that represents the possible strings used to represent a sign */

import type * as Predicate from 'effect/Predicate';

import * as MPredicate from '../../Predicate.js';

/**
 * Type of a SignString
 *
 * @category Models
 */
export type Type = '-' | '+' | '';

/**
 * `true` if `self` is a plus sign
 *
 * @category Predicates
 */
export const isPlusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('+');

/**
 * `true` if `self` is a minus sign
 *
 * @category Predicates
 */
export const isMinusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('-');
