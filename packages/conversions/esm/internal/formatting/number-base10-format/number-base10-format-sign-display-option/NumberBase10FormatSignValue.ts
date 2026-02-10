/** Module that implements a type that represents the values associated to the signs of a number */

import { MTypes } from '@parischap/effect-lib';
import { flow, Function, Option } from 'effect';
import * as CVNumberBase10FormatSignString from './NumberBase10FormatSignString.js';

/**
 * Type of a CVNumberBase10FormatSignString
 *
 * @category Models
 */
export type Type = -1 | 1;

export const fromSignString: MTypes.OneArgFunction<CVNumberBase10FormatSignString.Type, Type> =
  flow(
    Option.liftPredicate(CVNumberBase10FormatSignString.isMinusSign),
    Option.as(-1 as const),
    Option.getOrElse(Function.constant(1 as const)),
  );
