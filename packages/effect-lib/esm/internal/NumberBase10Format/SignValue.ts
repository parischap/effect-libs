/** Module that implements a type that represents the values associated to the signs of a value */

import { flow } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';

import type * as MTypes from '../../types/types.js';

import * as SignString from './SignString.js';

/**
 * Type of a SignValue
 *
 * @category Models
 */
export type Type = -1 | 1;

/**
 * Builds a `SignValue` from a `SignString`
 *
 * @category Constructors
 */
export const fromSignString: MTypes.OneArgFunction<SignString.Type, Type> = flow(
  Option.liftPredicate(SignString.isMinusSign),
  Option.as(-1 as const),
  Option.getOrElse(Function.constant(1 as const)),
);
