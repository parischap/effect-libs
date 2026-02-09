/** Module that implements a type that represents the possible strings used to represent a sign */

import { MPredicate } from '@parischap/effect-lib';
import { Predicate } from 'effect';

/**
 * Type of a CVNumberBase10FormatSignString
 *
 * @category Models
 */
export type Type = '-' | '+' | '';

export const isPlusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('+');
export const isMinusSign: Predicate.Predicate<Type> = MPredicate.strictEquals('-');
