/** This module implements a Type that represents an array of PPByPasser's (see PPByPasser.ts) */

import { Array, Function, pipe } from 'effect';
import * as PPByPasser from './PPByPasser.js';

/**
 * Type of a ByPassers
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPByPasser.Type> {}

/**
 * Returns a PPByPasser that is equivalent to `self`. The returned PPByPasser executes successively
 * each PPByPasser of `self` until it meets one that returns a `some`. If such a PPByPasser exists,
 * the corresponding `some` is returned. Otherwise, it returns a `none`.
 *
 * @category Destructors
 */
export const toSyntheticByPasser = (self: Type): PPByPasser.Action.Type =>
  function toSyntheticByPasser(this, constructors) {
    const initializedByPassers = Array.map(self, (byPasser) => byPasser.call(this, constructors));

    return (value) => pipe(initializedByPassers, Array.findFirst(Function.apply(value)));
  };
