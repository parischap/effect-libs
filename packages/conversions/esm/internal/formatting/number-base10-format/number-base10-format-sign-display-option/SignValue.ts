/** Module that implements a type that represents the values associated to the signs of a bigDecimal */

import { MTypes } from '@parischap/effect-lib';
import { flow, Function, Option } from 'effect';
import * as CVSignString from './SignString.js';

/**
 * Type of a CVSignString
 *
 * @category Models
 */
export type Type = -1n | 1n;

export const fromSignString: MTypes.OneArgFunction<CVSignString.Type, Type> = flow(
  Option.liftPredicate(CVSignString.isMinusSign),
  Option.as(-1n as const),
  Option.getOrElse(Function.constant(1n as const)),
);
