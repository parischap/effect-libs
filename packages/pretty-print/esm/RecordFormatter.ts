/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * A RecordFormatter is a function that lets you specify how to format a record. From the
 * stringified representation of the properties of a record which it receives, it must return the
 * stringified representation of the whole record. It can take care of aspects like printing on a
 * single or multiple lines, indentation when printing on multiple lines, adding specific
 * array/object marks,... This module defines six RecordFormatter instances :
 *
 * - `singleLine`: records are always printed on a single line.
 * - `multiLine`: records are always printed on multiple lines.
 * - `autoBasedOnConstituentNumber`: records are printed on multiple lines if they have strictly more
 *   than `limit` constituents.
 * - `autoBasedOnConstituentsLength`: records are printed on multiple lines if the total length of
 *   their stringified properties (excluding formatting characters) strictly exceeds `limit`.
 * - `autoBasedOnLongestConstituentsLength`: records are printed on multiple lines if the total length
 *   of the longest stringified property (excluding formatting characters) strictly exceeds
 *   `limit`.
 * - `singleLineForArraysMultiLineForOthers`: records that represent arrays are always printed on a
 *   single line, other records are always printed on multiple lines.
 *
 * You can define your own RecordFormatter's if the provided ones don't suit your needs. All you
 * have to do is provide a function that matches Type.
 *
 * @since 0.0.1
 */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, Number, Order, Struct, flow, pipe } from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as ColorWheel from './ColorWheel.js';
import * as FormattedString from './FormattedString.js';
import * as IndentMode from './IndentMode.js';
import * as RecordMarks from './RecordMarks.js';
import * as StringifiedValue from './StringifiedValue.js';
import * as StringifiedValues from './StringifiedValues.js';
import type * as Value from './Value.js';

/**
 * Type that represents a RecordFormatter. `value` is the Value (see Value.ts) representing a record
 * and stringifiedProps is an array of the stringified representations of the properties of that
 * record (see StringifiedValue.ts). Based on these two parameters, it must return a stringified
 * representations of the whole record.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	(value: Value.All): (stringifiedProps: StringifiedValues.Type) => StringifiedValue.Type;
}

/**
 * Function that returns a RecordFormatter instance that will always print records on a single line
 *
 * @since 0.0.1
 * @category Utils
 */
export const singleLine =
	(recordMarks: RecordMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		flow(
			StringifiedValues.addSeparatorBetweenProps(
				recordMarks.propertySeparator,
				colorSet.propertySeparatorColorer
			),
			Array.flatten,
			StringifiedValue.addExtremityMarks(
				MTypes.isArray(value.value) ? recordMarks.arrayMarks : recordMarks.objectMarks,
				pipe(colorSet.recordDelimitersColorWheel, ColorWheel.getColor(value.depth))
			),
			StringifiedValue.toSingleLine
		);

/**
 * Same as `singleLine` but uses the `RecordMarks.defaultSingleLine` instance
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultSingleLine: (colorSet: ColorSet.Type) => Type = singleLine(
	RecordMarks.defaultSingleLine
);

/**
 * Function that returns a RecordFormatter instance that will always print records on multiple lines
 *
 * @since 0.0.1
 * @category Utils
 */
export const multipleLines =
	(recordMarks: RecordMarks.Type, indentMode: IndentMode.Type) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		flow(
			StringifiedValues.addSeparatorBetweenProps(
				recordMarks.propertySeparator,
				colorSet.propertySeparatorColorer
			),
			StringifiedValues.indentProps(indentMode, colorSet.multiLineIndentColorer),
			Array.flatten,
			StringifiedValue.addExtremityMarks(
				MTypes.isArray(value.value) ? recordMarks.arrayMarks : recordMarks.objectMarks,
				pipe(colorSet.recordDelimitersColorWheel, ColorWheel.getColor(value.depth))
			)
		);

/**
 * Same as `multipleLines` but uses the `RecordMarks.defaultMultiLine` and the `IndentMode.tabify`
 * instances
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultTabified: (colorSet: ColorSet.Type) => Type = multipleLines(
	RecordMarks.defaultMultiLine,
	IndentMode.tabify
);

/**
 * Same as `multipleLines` but uses the `RecordMarks.defaultMultiLine` and the `IndentMode.treeify`
 * instances
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultTreeified: (colorSet: ColorSet.Type) => Type = multipleLines(
	RecordMarks.defaultTreeified,
	IndentMode.treeify
);

/**
 * Calls `singleLine` if the number of properties to print is less than or equal to `limit`. Calls
 * `multipleLines` otherwise
 *
 * @since 0.0.1
 * @category Utils
 */
export const autoBasedOnConstituentNumber =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multipleLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		flow(
			MMatch.make,
			MMatch.when(
				flow(Array.length, Number.lessThanOrEqualTo(limit)),
				singleLine(singleLineRecordMarks)(colorSet)(value)
			),
			MMatch.orElse(multipleLines(multipleLinesRecordMarks, indentMode)(colorSet)(value))
		);

/**
 * Same as `autoBasedOnConstituentNumber` but uses the `RecordMarks.defaultSingleLine`,
 * `RecordMarks.defaultMultiLine` and `IndentMode.tabify` instances
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultAutoBasedOnConstituentNumber: (
	limit: number
) => (colorSet: ColorSet.Type) => Type = autoBasedOnConstituentNumber(
	RecordMarks.defaultSingleLine,
	RecordMarks.defaultMultiLine,
	IndentMode.tabify
);

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters) is less than or equal to `limit`. Calls `multipleLines` otherwise
 *
 * @since 0.0.1
 * @category Utils
 */
export const autoBasedOnTotalLength =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multipleLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		flow(
			MMatch.make,
			MMatch.when(
				flow(
					Array.map<StringifiedValues.Type, number>(
						flow(Array.map(FormattedString.printedLength), Number.sumAll)
					),
					Number.sumAll,
					Number.lessThanOrEqualTo(limit)
				),
				singleLine(singleLineRecordMarks)(colorSet)(value)
			),
			MMatch.orElse(multipleLines(multipleLinesRecordMarks, indentMode)(colorSet)(value))
		);

/**
 * Same as `autoBasedOnTotalLength` but uses the `RecordMarks.defaultSingleLine`,
 * `RecordMarks.defaultMultiLine` and `IndentMode.tabify` instances
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultAutoBasedOnTotalLength: (limit: number) => (colorSet: ColorSet.Type) => Type =
	autoBasedOnTotalLength(
		RecordMarks.defaultSingleLine,
		RecordMarks.defaultMultiLine,
		IndentMode.tabify
	);

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters) is less than or equal to `limit`. Calls `multipleLines` otherwise
 *
 * @since 0.0.1
 * @category Utils
 */
export const autoBasedOnLongestPropLength =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multipleLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		flow(
			MMatch.make,
			MMatch.when(
				flow(
					Array.map<StringifiedValues.Type, number>(
						flow(Array.map(FormattedString.printedLength), Number.sumAll)
					),
					Array.match({
						onEmpty: () => false,
						onNonEmpty: flow(Array.max(Order.number), Number.lessThanOrEqualTo(limit))
					})
				),
				singleLine(singleLineRecordMarks)(colorSet)(value)
			),
			MMatch.orElse(multipleLines(multipleLinesRecordMarks, indentMode)(colorSet)(value))
		);

/**
 * Same as `autoBasedOnLongestPropLength` but uses the `RecordMarks.defaultSingleLine`,
 * `RecordMarks.defaultMultiLine` and `IndentMode.tabify` instances.
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultAutoBasedOnLongestPropLength: (
	limit: number
) => (colorSet: ColorSet.Type) => Type = autoBasedOnLongestPropLength(
	RecordMarks.defaultSingleLine,
	RecordMarks.defaultMultiLine,
	IndentMode.tabify
);

/**
 * Calls `singleLine` for arrays and multipleLines for other records. Calls `multipleLines`
 * otherwise
 *
 * @since 0.0.1
 * @category Utils
 */
export const singleLineForArraysMultiLineForOthers =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multipleLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		pipe(
			value,
			MMatch.make,
			MMatch.when(
				flow(Struct.get('value'), MTypes.isArray),
				singleLine(singleLineRecordMarks)(colorSet)
			),
			MMatch.orElse(multipleLines(multipleLinesRecordMarks, indentMode)(colorSet))
		);

/**
 * Same as `singleLineForArraysMultiLineForOthers` but uses the `RecordMarks.defaultSingleLine`,
 * `RecordMarks.defaultMultiLine` and `IndentMode.tabify` instances
 *
 * @since 0.0.1
 * @category Utils
 */
export const defaultSingleLineForArraysMultiLineForOthers: (colorSet: ColorSet.Type) => Type =
	singleLineForArraysMultiLineForOthers(
		RecordMarks.defaultSingleLine,
		RecordMarks.defaultMultiLine,
		IndentMode.tabify
	);
