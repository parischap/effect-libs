/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * A ByPasser is a function that lets you decide how to print certain values (the stringification
 * process is by-passed). For instance, you may prefer printing Dates as strings rather than as
 * objects.
 *
 * This module defines 4 ByPasser instances. Most of the time you will use `objectAsValue`.
 * `objectAsValueWithoutNullables` will come in handy when treeifying.
 *
 * You can define your own ByPasser's if the provided ones don't suit your needs. All you have to do
 * is provide a function that matches Type. The easiest way to do so is to call one of the existing
 * ByPasser instances for the part you want to keep and write your own code for the part you want to
 * change.
 *
 * @since 0.0.1
 */

import { MMatch, MOption, MString, MTypes } from '@parischap/effect-lib';
import { JsRegExp } from '@parischap/js-lib';
import { Array, flow, Option, pipe, String } from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import type * as Options from './Options.js';
import type * as StringifiedValue from './StringifiedValue.js';

const lineBreakRegExp = new RegExp(JsRegExp.lineBreak, 'g');

/**
 * Type that represents a ByPasser. `value` is the Value (see Value.ts) being currently printed.
 * options is the Options instance (see Options.ts) passed to the pretty-printer. If the ByPasser
 * returns a value of type `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this value will
 * be used as is to represent the input value. If it returns a `none` or `null` or `undefined`, the
 * normal stringification process will be applied. For primitive types, the normal stringification
 * process is to call the toString method (except for `null` and `undefined` which are printed as
 * 'null' and 'undefined' respectively). For records, the normal stringification process consists in
 * stringifying the constituents of the record (obtained by calling Reflect.ownKeys). The normal
 * stringification process does not handle colors. So most of the time, you will prefer passing one
 * of the predefined instances which this module provides.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	(value: MTypes.Unknown, options: Options.Type): MOption.OptionOrNullable<StringifiedValue.Type>;
}

/**
 * Function that returns a ByPasser instance which prints primitives as util.inspect does. This
 * ByPasser manages colors. It does not provide any special treatment for objects.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecord = (colorSet: ColorSet.Type): Type =>
	flow(
		MMatch.make,
		MMatch.when(
			MTypes.isString,
			flow(
				MString.prepend("'"),
				MString.append("'"),
				FormattedString.makeWith(colorSet.stringValueColorer),
				Array.of,
				Option.some
			)
		),
		MMatch.whenOr(
			MTypes.isNumber,
			MTypes.isBoolean,
			MTypes.isNull,
			MTypes.isUndefined,
			flow(
				MString.fromPrimitive,
				FormattedString.makeWith(colorSet.otherValueColorer),
				Array.of,
				Option.some
			)
		),
		MMatch.when(
			MTypes.isBigInt,
			flow(
				MString.fromNonNullablePrimitive,
				FormattedString.makeWith(colorSet.otherValueColorer),
				FormattedString.append(pipe('n', FormattedString.makeWith(colorSet.bigIntMarkColorer))),
				Array.of,
				Option.some
			)
		),
		MMatch.when(
			MTypes.isSymbol,
			flow(
				MString.fromNonNullablePrimitive,
				FormattedString.makeWith(colorSet.symbolValueColorer),
				Array.of,
				Option.some
			)
		),
		MMatch.orElse(() => Option.none())
	);

/**
 * Same as `objectAsRecord` but nullable values are not printed.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsRecordWithoutNullables =
	(colorSet: ColorSet.Type): Type =>
	(value, options) =>
		pipe(
			value,
			MMatch.make,
			MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
			MMatch.orElse(() => objectAsRecord(colorSet)(value, options))
		);

/**
 * Same as `objectAsRecord` but records receive the following treatment:
 *
 * - For functions: returns a some of `options.functionLabel`
 * - For arrays: return a `none`
 * - For non-null objects: first tries to call the toString method (only if it is different from
 *   Object.prototype.toString) and then the toJSON method. Returns a `some` of the result if
 *   successful. Returns a `none` otherwise.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValue =
	(colorSet: ColorSet.Type): Type =>
	(value, options) =>
		pipe(
			value,
			MMatch.make,
			MMatch.when(MTypes.isArray, () => Option.none()),
			MMatch.when(MTypes.isFunction, () => pipe(options.functionLabel, Array.of, Option.some)),
			MMatch.when(
				MTypes.isRecord,
				flow(
					MString.tryToStringToJSON,
					Option.map(
						flow(
							String.split(lineBreakRegExp),
							Array.map(FormattedString.makeWith(colorSet.otherValueColorer))
						)
					)
				)
			),
			MMatch.orElse(() => objectAsRecord(colorSet)(value, options))
		);

/**
 * Same as `objectAsValue` but nullable values are not printed.
 *
 * @since 0.0.1
 * @category Instances
 */
export const objectAsValueWithoutNullables =
	(colorSet: ColorSet.Type): Type =>
	(value, options) =>
		pipe(
			value,
			MMatch.make,
			MMatch.whenOr(MTypes.isNull, MTypes.isUndefined, () => Option.some(Array.empty())),
			MMatch.orElse(() => objectAsValue(colorSet)(value, options))
		);
