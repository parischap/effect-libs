/**
 * This module implements a type that represents a Token (see Token.ts) that reads as much of the
 * input string as it can while ensuring that the read data is valid.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import { MColor } from '@parischap/js-lib';
import { Equal, Equivalence, Function, Hash, Inspectable, Pipeable, Predicate } from 'effect';
import * as Token from './Pattern.js';

/**
 * Interface that represents a Greedy Token
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * RegExp that the token must comply with
	 *
	 * @since 0.0.1
	 */
	readonly pattern: RegExp;
	/** @internal */
	readonly [Token.TypeId]: Token.TypeId;
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
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type) {
		return this.id === '' ? this : this.id;
	},
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor without a id
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'id'>): Type => _make({ ...params, id: '' });

/**
 * Returns a copy of `self` with `id` set to `id`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setName =
	(id: string) =>
	(self: Type): Type =>
		_make({ ...self, id: id });

/**
 * FormatSet instance for unformatted output (uses the identity function for all parts to be
 * colored)
 *
 * @since 0.0.1
 * @category Instances
 */
export const unformatted: Type = _make({
	id: 'unformatted',
	stringValueFormatter: Function.identity,
	otherValueFormatter: Function.identity,
	symbolValueFormatter: Function.identity,
	bigIntMarkFormatter: Function.identity,
	propertyKeyFormatterWhenFunctionValue: Function.identity,
	propertyKeyFormatterWhenSymbol: Function.identity,
	propertyKeyFormatterWhenOther: Function.identity,
	propertySeparatorFormatter: Function.identity,
	recordDelimitersFormatWheel: FormatWheel.empty,
	keyValueSeparatorFormatter: Function.identity,
	prototypeMarkFormatter: Function.identity,
	multiLineIndentFormatter: Function.identity
});

/**
 * Example formatSet for ansi dark mode - Uses functions from the MColor module
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkMode: Type = _make({
	id: 'ansiDarkMode',
	stringValueFormatter: MString.colorize(MColor.green),
	otherValueFormatter: MString.colorize(MColor.yellow),
	symbolValueFormatter: MString.colorize(MColor.cyan),
	bigIntMarkFormatter: MString.colorize(MColor.magenta),
	propertyKeyFormatterWhenFunctionValue: MString.colorize(MColor.blue),
	propertyKeyFormatterWhenSymbol: MString.colorize(MColor.cyan),
	propertyKeyFormatterWhenOther: MString.colorize(MColor.red),
	propertySeparatorFormatter: MString.colorize(MColor.white),
	recordDelimitersFormatWheel: FormatWheel.ansiDarkMode,
	keyValueSeparatorFormatter: MString.colorize(MColor.white),
	prototypeMarkFormatter: MString.colorize(MColor.green),
	multiLineIndentFormatter: MString.colorize(MColor.green)
});
