/**
 * This module implements a string that may contain formatting characters, e.g css styles or unicode
 * characters. It contains a printedLength property that is the length of the printable characters,
 * i.e excluding all formatting characters. Used by the RecordFormatter.splitOnLongestPropLength and
 * RecordFormatter.splitOnTotalLength instances (see RecordFormatter.ts).
 *
 * As an end user, you will only have to creaate FormattedString's if you write your own ByPasser
 * instances (see ByPasser.ts)
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	Hash,
	Inspectable,
	Number,
	Order,
	Pipeable,
	Predicate,
	String,
	pipe
} from 'effect';

const moduleTag = '@parischap/pretty-print/FormattedString/';
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
	 * The underlying string
	 *
	 * @since 0.0.1
	 */
	readonly value: string;
	/**
	 * The length of the printable characters, i.e excluding all formatting characters
	 *
	 * @since 0.0.1
	 */
	readonly printedLength: number;
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
	that.printedLength === self.printedLength && that.value === self.value;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.structure(this));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a FormattedString from a string and an optional coloring function `f`. If `f` is omitted,
 * the `identity` function is used
 *
 * @since 0.0.1
 * @category Constructors
 */
export const makeWith =
	(f?: (i: string) => string) =>
	(s: string): Type =>
		_make({
			value: MTypes.isUndefined(f) ? s : f(s),
			printedLength: s.length
		});

/**
 * An empty FormattedString
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty = makeWith()('');

/**
 * Builds a new FormattedString by appending `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			value: self.value + that.value,
			printedLength: self.printedLength + that.printedLength
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
		_make({
			value: that.value + self.value,
			printedLength: that.printedLength + self.printedLength
		});

/**
 * Builds a new FormattedString by concatenating all passed FormattedStrings
 *
 * @since 0.0.1
 * @category Utils
 */
export const concat = (...sArr: ReadonlyArray<Type>): Type =>
	_make({
		value: pipe(
			sArr,
			Array.map((s) => s.value),
			Array.join('')
		),

		printedLength: pipe(
			sArr,
			Array.map((s) => s.printedLength),
			Number.sumAll
		)
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
		_make({
			value: pipe(
				sArr,
				Array.map((s) => s.value),
				Array.join(sep.value)
			),

			printedLength: pipe(
				sArr,
				Array.map((s) => s.printedLength),
				Number.sumAll,
				Number.sum(Math.max(0, sep.printedLength * (sArr.length - 1)))
			)
		});

/**
 * Builds a new FormattedString by repeating `n` times the passed FormattedString
 *
 * @since 0.0.1
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type =>
		_make({
			value: String.repeat(n)(self.value),
			printedLength: n * self.printedLength
		});

/**
 * Returns `true` if the FormattedString represents an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isEmpty = (self: Type): boolean => self.printedLength === 0;

/**
 * Returns `true` if the FormattedString does not represent an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isNonEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Defines an order on FormattedStrings based on the order of the underlying string - Does not
 * exclude formatting characters
 *
 * @since 0.0.1
 * @category Ordering
 */
export const order = Order.mapInput(Order.string, (s: Type) => s.value);

/**
 * Returns the printedLength of the FormattedString
 *
 * @since 0.0.1
 * @category Getters
 */
export const printedLength = (self: Type): number => self.printedLength;
