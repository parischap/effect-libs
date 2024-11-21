/**
 * This module implements a type that represents the result of formatting a string. It contains both
 * the original string (before applying the format) and the formatted string. The reason for keeping
 * the original string is that it allows to calculate the length of the string without the
 * formatting characters and to implement an Order (see Order.ts) that does not take formatting
 * characters into account. FormattedString's without formatting characters can be built with the
 * make function. FormattedString's with formatting characters are built by Formatter's (see
 * Formatter.ts)
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	Hash,
	Inspectable,
	Order,
	Pipeable,
	Predicate,
	String,
	Struct,
	flow,
	pipe
} from 'effect';

const moduleTag = '@parischap/ansi-styles/FormattedString/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a FormattedString
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The formatted string
	 *
	 * @since 0.0.1
	 */
	readonly formatted: string;

	/**
	 * The unformatted string
	 *
	 * @since 0.0.1
	 */
	readonly unformatted: string;

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

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.formatted === self.formatted;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.formatted, Hash.hash, Hash.cached(this));
	},
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
 * Builds a FormattedString from a string without applying any format.
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromString = (s: string): Type =>
	make({
		formatted: s,
		unformatted: s
	});

/**
 * An empty FormattedString
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
 * Builds a new FormattedString by appending `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		make({
			formatted: self.formatted + that.formatted,
			unformatted: self.unformatted + that.unformatted
		});

/**
 * Builds a new FormattedString by appending `self` to `that`
 *
 * @since 0.0.1
 * @category Utils
 */
export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		make({
			formatted: that.formatted + self.formatted,
			unformatted: that.unformatted + self.unformatted
		});

/**
 * Builds a new FormattedString by concatenating all passed FormattedStrings
 *
 * @since 0.0.1
 * @category Utils
 */
export const concat = (...sArr: ReadonlyArray<Type>): Type =>
	make({
		formatted: pipe(sArr, Array.map(formatted), Array.join('')),

		unformatted: pipe(sArr, Array.map(unformatted), Array.join(''))
	});

/**
 * Builds a new FormattedString by joining all passed FormattedStrings and adding a separator `sep`
 * in between
 *
 * @since 0.0.1
 * @category Utils
 */
export const join =
	(sep: Type) =>
	(sArr: ReadonlyArray<Type>): Type =>
		make({
			formatted: pipe(sArr, Array.map(formatted), Array.join(sep.formatted)),

			unformatted: pipe(sArr, Array.map(unformatted), Array.join(sep.unformatted))
		});

/**
 * Builds a new FormattedString by repeating `n` times the passed FormattedString
 *
 * @since 0.0.1
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type => {
		const repeat = String.repeat(n);
		return make({
			formatted: repeat(self.formatted),
			unformatted: repeat(self.unformatted)
		});
	};

/**
 * Returns `true` if the FormattedString represents an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isEmpty: Predicate.Predicate<Type> = flow(
	unformattedLength,
	MFunction.strictEquals(0)
);

/**
 * Returns `true` if the FormattedString does not represent an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isNonEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Defines an order on FormattedStrings based on the order of the `unformatted` property
 *
 * @since 0.0.1
 * @category Ordering
 */
export const order = Order.mapInput(Order.string, formatted);
