/**
 * This module implements a type that applies a Format (see Format.ts) to a string. You may build a
 * Formatter without previously building a Format in the two following situations: Formatter that
 * does not apply any formatting and formatter that only applies a foreground color.
 *
 * @since 0.1.0
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Function, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASColor from './Color.js';
import * as ASFormat from './Format.js';
import * as ASFormattedString from './FormattedString.js';

const moduleTag = '@parischap/ansi-styles/Formatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of the action of a Formatter
 *
 * @since 0.0.1
 * @category Models
 */
export interface ActionType extends MTypes.OneArgFunction<string, ASFormattedString.Type> {}

/**
 * Type that represents a Formatter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this Formatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Action of this Formatter instance.
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType;

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

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor from a StringTransformer
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromStringTransformer =
	(name: string): MTypes.OneArgFunction<MTypes.StringTransformer, Type> =>
	(f) =>
		_make({
			name,
			action: (s) =>
				ASFormattedString.make({
					formatted: f(s),
					unformatted: s
				})
		});

/**
 * Constructor from a Color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColor = (color: ASColor.Type): Type =>
	fromStringTransformer(color.name)(color.fgStringTransformer);

/**
 * Creates a Formatter that applies the given Format.
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromFormat = (format: ASFormat.Type): Type =>
	pipe(
		format,
		ASFormat.name,
		fromStringTransformer,
		Function.apply(ASFormat.stringTransformer(format))
	);

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Gets the action of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const action: MTypes.OneArgFunction<Type, ActionType> = Struct.get('action');
