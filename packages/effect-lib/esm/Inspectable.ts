/**
 * A simple extension to the Effect Inspectable module
 *
 * @since 0.3.3
 */

import { Inspectable as EInspectable, Option, pipe } from 'effect';
import * as MRecord from './Record.js';

export const moduleTag = '@parischap/effect-lib/Inspectable/';

/**
 * Symbol used to define a special prototype function that must return a name identifying the object
 *
 * @since 0.5.0
 * @category Models
 */
export const NameSymbol: unique symbol = Symbol.for(moduleTag + 'NameSymbol/') as NameSymbol;

/**
 * Type used to define a special prototype function that must return a name identifying the object
 *
 * @since 0.5.0
 * @category Models
 */
export type NameSymbol = typeof NameSymbol;

export interface Inspectable extends EInspectable.Inspectable {
	readonly [NameSymbol]: () => string;
}
/**
 * Prototype of an `Inspectable` that overloads the `toJSON` method. If the object (usually its
 * prototype) has a `[NameSymbol]` function, returns the result of this function. Otherwise, return
 * this with an extra '_id' field containing the moduleTag.
 *
 * @since 0.3.3
 * @category Instances
 */
export const BaseProto = (moduleTag: string): EInspectable.Inspectable => ({
	...EInspectable.BaseProto,
	toJSON(this: {}): unknown {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: NameSymbol
			}),
			Option.getOrElse(() => ({ _id: moduleTag, ...this }))
		);
	},
	toString(this: {}): string {
		return pipe(
			this,
			MRecord.tryZeroParamStringFunction({
				functionName: NameSymbol
			}),
			Option.getOrElse(() => EInspectable.BaseProto.toString.call(this))
		);
	}
});
