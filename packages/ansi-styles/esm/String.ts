/**
 * This module implements a type that represents the result of formatting a string. It contains both
 * the original string (before applying the format) and the formatted string. The reason for keeping
 * the original string is that it allows to calculate the length of the string without the
 * formatting characters and to implement an Order (see Order.ts) that does not take formatting
 * characters into account.
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Function,
	Inspectable,
	Order,
	Pipeable,
	Predicate,
	String,
	Struct,
	flow,
	pipe
} from 'effect';
import * as ASBasicStyle from './BasicStyle.js';

export const moduleTag = '@parischap/ansi-styles/String/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a String
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The strings to style
	 *
	 * @since 0.0.1
	 */
	readonly strings: ReadonlyArray<string | Type>;

	/**
	 * The style to apply to `strings`
	 *
	 * @since 0.0.1
	 */
	readonly style: ASBasicStyle.Type;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a String from a string without applying any format.
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromString: ASFormatter.ActionType = fromStyleAndString(Function.identity);

/**
 * An empty String
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty = fromString('');

/**
 * Returns the formatted property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const formatted: MTypes.OneArgFunction<Type, string> = Struct.get('formatted');

/**
 * Returns the unformatted property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const unformatted: MTypes.OneArgFunction<Type, string> = Struct.get('unformatted');

/**
 * Returns the length of the unformatted property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const unformattedLength: MTypes.OneArgFunction<Type, number> = flow(
	Struct.get('unformatted'),
	String.length
);

/**
 * Builds a new String by appending `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			formatted: self.formatted + that.formatted,
			unformatted: self.unformatted + that.unformatted
		});

/**
 * Builds a new String by appending `self` to `that`
 *
 * @since 0.0.1
 * @category Utils
 */
export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			formatted: that.formatted + self.formatted,
			unformatted: that.unformatted + self.unformatted
		});

/**
 * Builds a new String by concatenating all passed Strings
 *
 * @since 0.0.1
 * @category Utils
 */
export const concat = (...sArr: ReadonlyArray<Type>): Type =>
	_make({
		formatted: pipe(sArr, Array.map(formatted), Array.join('')),

		unformatted: pipe(sArr, Array.map(unformatted), Array.join(''))
	});

/**
 * Builds a new String by joining all passed Strings and adding a separator `sep` in between
 *
 * @since 0.0.1
 * @category Utils
 */
export const join =
	(sep: Type) =>
	(sArr: ReadonlyArray<Type>): Type =>
		_make({
			formatted: pipe(sArr, Array.map(formatted), Array.join(sep.formatted)),

			unformatted: pipe(sArr, Array.map(unformatted), Array.join(sep.unformatted))
		});

/**
 * Builds a new String by repeating `n` times the passed String
 *
 * @since 0.0.1
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type => {
		const repeat = String.repeat(n);
		return _make({
			formatted: repeat(self.formatted),
			unformatted: repeat(self.unformatted)
		});
	};

/**
 * Returns `true` if the String represents an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isEmpty: Predicate.Predicate<Type> = flow(
	unformattedLength,
	MFunction.strictEquals(0)
);

/**
 * Returns `true` if the String does not represent an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isNonEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Defines an order on Strings based on the order of the `unformatted` property
 *
 * @since 0.0.1
 * @category Ordering
 */
export const order = Order.mapInput(Order.string, formatted);
