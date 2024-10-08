/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that represents a set of colors to be applied to the different
 * parts of a stringified value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { JsString, MColor } from '@parischap/js-lib';
import { Equal, Equivalence, Function, Hash, Inspectable, Pipeable, Predicate } from 'effect';
import * as ColorWheel from './ColorWheel.js';

const moduleTag = '@parischap/pretty-print/ColorSet/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Representation of a function that applies a color to a string. A function that does not apply any
 * color is the identity function. For ANSI colors, you can use the functions exported by the MColor
 * module of the @parischap/js-lib package or use an external package.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Colorer extends MTypes.OneArgFunction<string, string> {}

/**
 * Interface that represents a ColorSet
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ColorSet instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Color applied to values of type string
	 *
	 * @since 0.0.1
	 */
	readonly stringValueColorer: Colorer;
	/**
	 * Color applied to values of type symbol
	 *
	 * @since 0.0.1
	 */
	readonly symbolValueColorer: Colorer;
	/**
	 * Color applied to value of type other than string or symbol, including 'null' and 'undefined'
	 *
	 * @since 0.0.1
	 */
	readonly otherValueColorer: Colorer;
	/**
	 * Color applied to the bigint mark appended to bigint numbers
	 *
	 * @since 0.0.1
	 */
	readonly bigIntMarkColorer: Colorer;
	/**
	 * Color applied to the key of a record whose value is a function
	 *
	 * @since 0.0.1
	 */
	readonly propertyKeyColorerWhenFunctionValue: Colorer;
	/**
	 * Color applied to the key of a record that is a symbol (except if its value is a function, in
	 * which case the propertyKeyColorerWhenFunctionValue is applied)
	 *
	 * @since 0.0.1
	 */
	readonly propertyKeyColorerWhenSymbol: Colorer;
	/**
	 * Color applied to the key of a record that is not a symbol and whose value is not a function
	 *
	 * @since 0.0.1
	 */
	readonly propertyKeyColorerWhenOther: Colorer;
	/**
	 * Color applied to the separator used between two properties of a record, typically ','
	 *
	 * @since 0.0.1
	 */
	readonly propertySeparatorColorer: Colorer;
	/**
	 * Color applied to the delimiters of a record, typically '[]' for arrays and '{}' for objects. It
	 * is a colorWheel (see ColorWheel.ts), so the color of the delimiters will change in function of
	 * the depth of the object or array in the initial value to stringify.
	 *
	 * @since 0.0.1
	 */
	readonly recordDelimitersColorWheel: ColorWheel.Type;
	/**
	 * Color applied to the separator used between the key and the value of the properties of an
	 * object, typically ':'
	 *
	 * @since 0.0.1
	 */
	readonly keyValueSeparatorColorer: Colorer;
	/**
	 * Color applied to the mark that is appended and/or prepended to the keys of an object to
	 * indicate that this key belongs to its prototypal chain
	 *
	 * @since 0.0.1
	 */
	readonly prototypeMarkColorer: Colorer;
	/**
	 * Color applied to the indentation of a multi-line value, provided that this indentation shows
	 * (which is not the case of a tab or space). Usually used when treeifying where tabs are replaced
	 * by special tree characters.
	 *
	 * @since 0.0.1
	 */
	readonly multiLineIndentColorer: Colorer;
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
