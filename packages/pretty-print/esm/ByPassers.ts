/** This module implements a Type that represents an array of ByPasser's (see ByPasser.ts) */

import { MArray } from '@parischap/effect-lib';
import { Array, Function, pipe } from 'effect';
import * as PPByPasser from './ByPasser.js';

/**
 * Type of a ByPassers
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPByPasser.Type> {}

/**
 * Returns a ByPasser that is equivalent to `self`. The returned ByPasser executes successively each
 * ByPasser of `self` until it meets one that returns a `some`. If such a ByPasser exists, the
 * corresponding `some` is returned. Otherwise, it returns a `none`.
 *
 * @category Destructors
 */
export const toSyntheticByPasserAction = (self: Type): PPByPasser.Action.Type =>
	function (this, constructors) {
		const initializedByPassers = Array.map(self, (byPasser) => byPasser.call(this, constructors));

		return (value) => pipe(initializedByPassers, MArray.firstSomeResult(Function.apply(value)));
	};
