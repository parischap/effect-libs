/**
 * Similarly to Formatter's (see Formatter.ts), WheelFormatter's apply a format to a string. But
 * they contain an array of `n` Format's instead of a single Format. Their formatting action needs
 * an extra parameter of type `A` and they also require a function that converts an `A` into an
 * index `i`. The format used is the one at position `i` modulo `n` in the array (hence the wheel
 * name)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MNumber, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, flow, Function, Hash, pipe, Pipeable, Predicate } from 'effect';
import * as ASFormatter from './Formatter.js';
import { ASFormatterArray } from './index.js';

const moduleTag = '@parischap/ansi-styles/WheelFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/** Type of the action of a WheelFormatter. `n` is the index of the format to use. */
interface ActionType<in A> {
	(a: A): ASFormatter.ActionType;
}

type IndexFromValue<in A> = MTypes.OneArgFunction<A, number>;

/**
 * Type that represents a WheelFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in A> extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this WheelFormatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Action of this WheelFormatter
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType<A>;

	/**
	 * 'true' if the first parameter of 'action' is unnecessary, i.e. this WheelFormatter was built
	 * from zero or one Formatter. 'false' otherwise.
	 *
	 * @since 0.0.1
	 */
	readonly hasValueIndependantAction: boolean;

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
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol]<A>(this: Type<A>) {
		return this.name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name = (self: Type<never>): string => self[MInspectable.NameSymbol]();

/**
 * Returns the `action` of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const action = <A>(self: Type<A>): ActionType<A> => self.action;

/**
 * Returns the `actionNeedsA` of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const hasValueIndependantAction = (self: Type<never>): boolean =>
	self.hasValueIndependantAction;

/**
 * Constructs an empty WheelFormatter
 *
 * @since 0.0.1
 * @category Constructors
 */
export const none: Type<unknown> = _make({
	// Name must be None so `none` and `fromFormat(ASFormat.none)` are equal
	name: 'None',
	action: () => Function.identity,
	hasValueIndependantAction: true
});

/**
 * Constructs a WheelFormatter from a single Formatter
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromFormatter = (formatter: ASFormatter.Type): Type<unknown> => {
	return _make({
		name: ASFormatter.name(formatter),
		action: () => formatter.action,
		hasValueIndependantAction: true
	});
};

/**
 * Constructs a WheelFormatter from an array of Format's
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromFormatterArray =
	<A>(indexFromValue: IndexFromValue<A>) =>
	({
		name,
		formatters
	}: {
		readonly name: string;
		readonly formatters: ASFormatterArray.Type;
	}): Type<A> => {
		const underlyings = ASFormatterArray.underlyings(formatters);
		const numUnderlyings = underlyings.length;
		const action: ActionType<A> = pipe(
			underlyings,
			MArray.match012({
				onEmpty: () => () => Function.identity,
				onSingleton: flow(ASFormatter.action, Function.constant),
				onOverTwo: (formatters) => (a: A) =>
					pipe(
						a,
						indexFromValue,
						MNumber.intModulo(numUnderlyings),
						/* eslint-disable-next-line functional/prefer-readonly-type*/
						Function.flip<[index: number], [self: readonly ASFormatter.Type[]], ASFormatter.Type>(
							MArray.unsafeGet
						)(formatters),
						ASFormatter.action
					)
			})
		);
		return _make({
			name,
			action,
			hasValueIndependantAction: numUnderlyings < 2
		});
	};
