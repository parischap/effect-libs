/**
 * This module implements a type that represents an array of Formatter's (see Formatter.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';
import * as ASFormatter from './Formatter.js';

const moduleTag = '@parischap/ansi-styles/FormatterArray/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an array of Formatter's
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this FormatterArray instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Array of underlying underlyings
	 *
	 * @since 0.0.1
	 */
	readonly underlyings: ReadonlyArray<ASFormatter.Type>;

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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol](this: Type) {
		return this.name;
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
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name = (self: Type): string => self[MInspectable.NameSymbol]();

/**
 * Gets the formats of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const underlyings = (self: Type): Array<ASFormatter.Type> => self.underlyings as never;

/**
 * Instance that contains the formats representing the eight basic original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allBasicOrignalColors: Type = make({
	name: 'AllBasicOrignalColors',
	underlyings: Array.make(
		ASFormatter.Original.black,
		ASFormatter.Original.red,
		ASFormatter.Original.green,
		ASFormatter.Original.yellow,
		ASFormatter.Original.blue,
		ASFormatter.Original.magenta,
		ASFormatter.Original.cyan,
		ASFormatter.Original.white
	)
});

/**
 * Instance that contains the formats representing the eight bright original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allBrightOrignalColors: Type = make({
	name: 'allBrightOrignalColors',
	underlyings: Array.make(
		ASFormatter.Original.black,
		ASFormatter.Original.red,
		ASFormatter.Original.green,
		ASFormatter.Original.yellow,
		ASFormatter.Original.blue,
		ASFormatter.Original.magenta,
		ASFormatter.Original.cyan,
		ASFormatter.Original.white
	)
});

/**
 * Instance that contains the formats representing the sixteen original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allOrignalColors: Type = make({
	name: '',
	underlyings: Array.appendAll(
		allBasicOrignalColors.underlyings,
		allBrightOrignalColors.underlyings
	)
});
