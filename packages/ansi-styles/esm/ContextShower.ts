/**
 * A ContextShower is built as the result of calling a ContextFormatter with a string `s`. It will
 * always show the same string `s` but in a format depending on the passed context
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Pipeable, Predicate, Struct } from 'effect';
import * as ASContextFormatter from './ContextFormatter.js';
import * as ASFormattedString from './FormattedString.js';

export const moduleTag = '@parischap/ansi-styles/ContextShower/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of the action of a ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export type ActionType<in C> = MTypes.OneArgFunction<C, ASFormattedString.Type>;

/**
 * Type that represents a ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in C> extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ContextFormatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Action of this ContextFormatter
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType<C>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */

export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type<never>> = (self, that) =>
	that.name === self.name;

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[TypeId]: TypeId,
	[Equal.symbol]<C>(this: Type<C>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<C>(this: Type<C>) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol]<C>(this: Type<C>) {
		return this.name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <C>(params: MTypes.Data<Type<C>>): Type<C> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromContextFormatter =
	<C>(contextFormatter: ASContextFormatter.Type<C>) =>
	(s: string): Type<C> =>
		_make({
			name: `${s}FormattedWith${contextFormatter.name}`,
			action: (context) => contextFormatter.action(context)(s)
		});

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type<never>, string> = Struct.get('name');

/**
 * Gets the `action` of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const action: <C>(self: Type<C>) => ActionType<C> = Struct.get('action');
