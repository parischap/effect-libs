/** A simple extension to the Effect Inspectable module */

import { Inspectable, Option, pipe } from 'effect';
import * as MRecord from './Record.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Inspectable/';

/**
 * Symbol used to define a special prototype function that must return an id for the object
 *
 * @category Models
 */
export const IdSymbol: unique symbol = Symbol.for(moduleTag + 'IdSymbol/') as IdSymbol;

/**
 * Type used to define a special prototype function that must return an id for the object
 *
 * @category Models
 */
export type IdSymbol = typeof IdSymbol;

/**
 * Interface that an object should implement when an id can be used to represent it
 *
 * @category Models
 */
export interface Type extends Inspectable.Inspectable {
	readonly [IdSymbol]: () => string;
}

/**
 * Prototype of an `Inspectable` that overloads the `toJSON` and `toString` methods.
 *
 * @category Constants
 */
export const BaseProto = (moduleTag: string): Inspectable.Inspectable => ({
	...Inspectable.BaseProto,
	/**
	 * If the object (usually its prototype) has an `[IdSymbol]` function, returns the result of this
	 * function. Otherwise, returns this with an extra '_id' field containing the moduleTag.
	 */
	toJSON(this: {}): unknown {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: IdSymbol
			}),
			Option.getOrElse(() => ({ _id: moduleTag, ...this }))
		);
	},
	/**
	 * If the object (usually its prototype) has an `[IdSymbol]` function, returns the result of this
	 * function. Otherwise, calls the Inspectable.toString function
	 */
	toString(this: {}): string {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: IdSymbol
			}),
			Option.getOrElse(() => Inspectable.BaseProto.toString.call(this))
		);
	}
});
