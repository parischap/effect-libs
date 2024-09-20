/**
 * This module implements a type that represents a set of colors to be applied to the different
 * parts of a stringified value.
 *
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * @since 0.0.1
 */

import { MTypes } from '@parischap/effect-lib';
import { JsColor, JsString } from '@parischap/js-lib';
import { Array, Function } from 'effect';
import type * as ColorWheel from './ColorWheel.js';

/**
 * Representation of a function that applies a color to a string. A function that does not apply any
 * color is the identity function. For ANSI colors, you can use the functions exported by the
 * JsColor module of the @parischap/js-lib package or use an external package.
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
export interface Type {
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
}

/**
 * Colorset instance for uncolored output (uses the identity function for all parts to be colored)
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncolored: Type = {
	stringValueColorer: Function.identity,
	otherValueColorer: Function.identity,
	symbolValueColorer: Function.identity,
	bigIntMarkColorer: Function.identity,
	propertyKeyColorerWhenFunctionValue: Function.identity,
	propertyKeyColorerWhenSymbol: Function.identity,
	propertyKeyColorerWhenOther: Function.identity,
	propertySeparatorColorer: Function.identity,
	recordDelimitersColorWheel: Array.empty(),
	keyValueSeparatorColorer: Function.identity,
	prototypeMarkColorer: Function.identity,
	multiLineIndentColorer: Function.identity
};

/**
 * Example colorset for ansi dark mode - Uses functions from the JsColor module
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkMode: Type = {
	stringValueColorer: JsString.colorize(JsColor.green),
	otherValueColorer: JsString.colorize(JsColor.yellow),
	symbolValueColorer: JsString.colorize(JsColor.cyan),
	bigIntMarkColorer: JsString.colorize(JsColor.magenta),
	propertyKeyColorerWhenFunctionValue: JsString.colorize(JsColor.blue),
	propertyKeyColorerWhenSymbol: JsString.colorize(JsColor.cyan),
	propertyKeyColorerWhenOther: JsString.colorize(JsColor.red),
	propertySeparatorColorer: JsString.colorize(JsColor.white),
	recordDelimitersColorWheel: Array.make(
		JsString.colorize(JsColor.green),
		JsString.colorize(JsColor.yellow),
		JsString.colorize(JsColor.magenta),
		JsString.colorize(JsColor.cyan),
		JsString.colorize(JsColor.red),
		JsString.colorize(JsColor.blue),
		JsString.colorize(JsColor.white)
	),
	keyValueSeparatorColorer: JsString.colorize(JsColor.white),
	prototypeMarkColorer: JsString.colorize(JsColor.green),
	multiLineIndentColorer: JsString.colorize(JsColor.green)
};
