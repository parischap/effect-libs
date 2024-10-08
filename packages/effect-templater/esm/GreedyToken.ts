/**
 * This module implements a type that represents a Token (see Token.ts) that reads as much of the
 * input string as it can while ensuring that the read data is valid.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { JsString, MColor } from '@parischap/js-lib';
import { Equal, Equivalence, Function, Hash, Inspectable, Pipeable, Predicate } from 'effect';
import * as Token from './Token.js';

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
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type) {
		return this.name === '' ? this : this.name;
	},
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor without a name
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'name'>): Type =>
	_make({ ...params, name: '' });

/**
 * Returns a copy of `self` with `name` set to `name`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setName =
	(name: string) =>
	(self: Type): Type =>
		_make({ ...self, name: name });

/**
 * Colorset instance for uncolored output (uses the identity function for all parts to be colored)
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncolored: Type = _make({
	name: 'uncolored',
	stringValueColorer: Function.identity,
	otherValueColorer: Function.identity,
	symbolValueColorer: Function.identity,
	bigIntMarkColorer: Function.identity,
	propertyKeyColorerWhenFunctionValue: Function.identity,
	propertyKeyColorerWhenSymbol: Function.identity,
	propertyKeyColorerWhenOther: Function.identity,
	propertySeparatorColorer: Function.identity,
	recordDelimitersColorWheel: ColorWheel.empty,
	keyValueSeparatorColorer: Function.identity,
	prototypeMarkColorer: Function.identity,
	multiLineIndentColorer: Function.identity
});

/**
 * Example colorset for ansi dark mode - Uses functions from the MColor module
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkMode: Type = _make({
	name: 'ansiDarkMode',
	stringValueColorer: JsString.colorize(MColor.green),
	otherValueColorer: JsString.colorize(MColor.yellow),
	symbolValueColorer: JsString.colorize(MColor.cyan),
	bigIntMarkColorer: JsString.colorize(MColor.magenta),
	propertyKeyColorerWhenFunctionValue: JsString.colorize(MColor.blue),
	propertyKeyColorerWhenSymbol: JsString.colorize(MColor.cyan),
	propertyKeyColorerWhenOther: JsString.colorize(MColor.red),
	propertySeparatorColorer: JsString.colorize(MColor.white),
	recordDelimitersColorWheel: ColorWheel.ansiDarkMode,
	keyValueSeparatorColorer: JsString.colorize(MColor.white),
	prototypeMarkColorer: JsString.colorize(MColor.green),
	multiLineIndentColorer: JsString.colorize(MColor.green)
});
