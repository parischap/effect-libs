/**
 * This module implements a PlaceHolder which is the association of an id and a Transformer (see
 * Transformer.ts). The id is the string to look for in the template (see Template.ts). Upon
 * writing, each PlaceHolder present in the template must given a value. For a given PlaceHolder,
 * the value to write is transformed into a string by the Transformer and is inserted into the
 * template at all the positions where the id of that PlaceHolder appears. Upon reading, a text
 * similar to the template must be provided. Strings are read from the text at all the positions
 * where a PlaceHolder appears in the template. The amount of text to read for each PlaceHolder is
 * determined by its Transformer. If the same Placeholder appears several times, the same string
 * must present at all the positions where this PlaceHolder appears. This string is then converted
 * to a value by the Transformer.
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Inspectable, Pipeable, Predicate, Types } from 'effect';
import * as Transformer from './Transformer.js';

const moduleTag = '@parischap/templater/PlaceHolder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PlaceHolder.
 *
 * @category Models
 */
export interface Type<in out A> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/** The id of this PlaceHolder */
	readonly id: string;

	/** The Transformer associated to this PlaceHolder */
	readonly transformer: Transformer.Type<A>;

	/** @internal */
	readonly [_TypeId]: {
		readonly _A: Types.Invariant<A>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const equivalence: Equivalence.Equivalence<Type<any>> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[_TypeId]: {
		_A: MTypes.invariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);
