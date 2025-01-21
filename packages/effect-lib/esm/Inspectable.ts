/** A simple extension to the Effect Inspectable module */

import { Inspectable as EInspectable, Option, pipe } from 'effect';
import * as MRecord from './Record.js';

/**
 * Module tag
 *
 * @category Models
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
export interface Inspectable extends EInspectable.Inspectable {
	readonly [IdSymbol]: () => string;
}
/**
 * Prototype of an `Inspectable` that overloads the `toJSON` method. If the object (usually its
 * prototype) has a `[IdSymbol]` function, returns the result of this function. Otherwise, return
 * this with an extra '_id' field containing the moduleTag.
 *
 * @category Instances
 */
export const BaseProto = (moduleTag: string): EInspectable.Inspectable => ({
	...EInspectable.BaseProto,
	toJSON(this: {}): unknown {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: IdSymbol
			}),
			Option.getOrElse(() => ({ _id: moduleTag, ...this }))
		);
	},
	toString(this: {}): string {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: IdSymbol
			}),
			Option.getOrElse(() => EInspectable.BaseProto.toString.call(this))
		);
	}
});
