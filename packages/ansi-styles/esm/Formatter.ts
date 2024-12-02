/**
 * This module implements a type whose action is to apply a Format (see Format.ts) to a string.
 * Building a Formatter is not required but recommended for debugging purposes.
 *
 * @since 0.1.0
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Function, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASFormat from './Format.js';
import * as ASFormattedString from './FormattedString.js';

export const moduleTag = '@parischap/ansi-styles/Formatter/';
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
	readonly id: string;

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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.id));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
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
	(id: string): MTypes.OneArgFunction<MTypes.StringTransformer, Type> =>
	(f) =>
		_make({
			id,
			action: ASFormattedString.fromStyleAndString(f)
		});

/**
 * Creates a Formatter that applies the given Format.
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromFormat = (format: ASFormat.Type): Type =>
	pipe(
		format,
		ASFormat.id,
		fromStringTransformer,
		Function.apply(ASFormat.stringTransformer(format))
	);

/**
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Gets the action of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const action: MTypes.OneArgFunction<Type, ActionType> = Struct.get('action');
