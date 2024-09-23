/**
 * This module implements a ValueContainer which is a container for a value to be stored in a cache
 * (see Cache.ts).
 *
 * @since 0.0.6
 */
import { Equal, Equivalence, Hash, Inspectable, Predicate, Types } from 'effect';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/ValueContainer/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;

/**
 * @since 0.0.6
 * @category Symbol
 */
export type TypeId = typeof TypeId;

/**
 * Interface that represents a ValueContainer
 *
 * @since 0.0.6
 * @category Models
 */
export interface Type<out A> extends Equal.Equal, Inspectable.Inspectable {
	/**
	 * The value calculated by the LookUp function
	 *
	 * @since 0.0.6
	 */
	readonly value: A;
	/**
	 * The time at which the value was calculated
	 *
	 * @since 0.0.6
	 */
	readonly storeDate: number;
	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Covariant<A>;
	};
}

/**
 * Returns true if `u` is a ValueContainer
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Returns a ValueContainer equivalence based on the specified equivalence for the value property
 *
 * @since 0.0.6
 * @category Equivalence
 */
export const getEquivalence = <A>(
	isEquivalent: Equivalence.Equivalence<A>
): Equivalence.Equivalence<Type<A>> =>
	Equivalence.make((self, that) => isEquivalent(self.value, that.value));

/** Returns a ValueContainer equivalence based on the equality of their values */
const _equivalence = getEquivalence(Equal.equals);

export {
	/**
	 * ValueContainer equivalence
	 *
	 * @since 0.0.6
	 * @category Instances
	 */
	_equivalence as Equivalence
};

/** ValueContainer prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const valueContainerProto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.covariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return Hash.cached(this, Hash.hash(this.value));
	},
	toJSON<A>(this: Type<A>) {
		return {
			value: Inspectable.toJSON(this.value),
			storeDate: Inspectable.toJSON(this.storeDate)
		};
	},
	[Inspectable.NodeInspectSymbol]<A>(this: Type<A>) {
		return this.toJSON();
	},
	toString<A>(this: Type<A>) {
		return Inspectable.format(this.toJSON());
	}
};

/**
 * Constructs a ValueContainer
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(valueContainerProto, params);
