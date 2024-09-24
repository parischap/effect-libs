/**
 * A Transformer<A> is used to transform a string into a value of type A and vice versa. It is used
 * within a Token (see Token.ts).
 *
 * @since 0.0.1
 */

import { MString } from '@parischap/effect-lib';
import { JsRegExp } from '@parischap/js-lib';
import { Option } from 'effect';

const unsignedIntRegExp = new RegExp(JsRegExp.positiveInteger);

/**
 * Type that represents a Transformer. A Transformer instance is an object with a read and write
 * method.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in out A> {
	/**
	 * Reads as much as it can from the start of the input string so that the read string can be
	 * converted to an A. If nothing can be read, returns a `None`. Otherwise carries out the
	 * conversion, and returns a `Some` of the converted value and the remaining string
	 *
	 * @since 0.0.1
	 */
	readonly read: (input: string) => readonly [value: Option.Option<A>, remaining: string];
	/**
	 * Tries to convert a value of type A to a string. Returns a `Some` if successful, a `None`
	 * otherwise
	 *
	 * @since 0.0.1
	 */
	readonly write: (value: A) => Option.Option<string>;
}

export const unsignedInt: Type<number> = {
	read: (input) => {
		const readString = MString.match();
	},
	write(value) {
		return value.toString();
	}
};
