/** Module that implements a type that represents the values associated to the signs of a value */

import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow} from 'effect'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as CVSignString from './SignString.js';

/**
 * Type of a CVSignString
 *
 * @category Models
 */
export type Type = -1 | 1;

export const fromSignString: MTypes.OneArgFunction<CVSignString.Type, Type> = flow(
  Option.liftPredicate(CVSignString.isMinusSign),
  Option.as(-1 as const),
  Option.getOrElse(Function.constant(1 as const)),
);
