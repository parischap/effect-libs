/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that takes care of the formatting of records. From the stringified
 * representation of the properties of a record which it receives, it must return the stringified
 * representation of the whole record. It can take care of aspects like printing on a single or
 * multiple lines, indentation when printing on multiple lines, adding specific array/object
 * marks,...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Inspectable,
	Number,
	Order,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as ColorWheel from './ColorWheel.js';
import * as FormattedString from './FormattedString.js';
import * as IndentMode from './IndentMode.js';
import * as RecordMarks from './RecordMarks.js';
import * as StringifiedValue from './StringifiedValue.js';
import * as StringifiedValues from './StringifiedValues.js';
import type * as Value from './Value.js';

const moduleTag = '@parischap/pretty-print/RecordFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a RecordFormatter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this RecordFormatter instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Action of this RecordFormatter. `value` is the Value (see Value.ts) representing a record and
	 * stringifiedProps is an array of the stringified representations of the properties of that
	 * record (see StringifiedValue.ts). Based on these two parameters, it must return a stringified
	 * representations of the whole record.
	 *
	 * @since 0.0.1
	 */
	readonly action: (
		value: Value.All
	) => (stringifiedProps: StringifiedValues.Type) => StringifiedValue.Type;
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
 * Function that returns a RecordFormatter instance that will always print records on a single line
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLineMaker =
	(recordMarks: RecordMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name: colorSet.name + 'SingleLineWith' + String.capitalize(recordMarks.name),
			action: (value) =>
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
				)
		});

/**
 * Alias for `singleLineMaker(RecordMarks.singleLine)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine: (colorSet: ColorSet.Type) => Type = singleLineMaker(
	RecordMarks.singleLine
);

/**
 * Function that returns a RecordFormatter instance that will always print records on multiple lines
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLineMaker =
	(recordMarks: RecordMarks.Type, indentMode: IndentMode.Type) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'MultiLineWith' +
				String.capitalize(recordMarks.name) +
				'And' +
				String.capitalize(indentMode.name),
			action: (value) =>
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
				)
		});

/**
 * Alias for `multiLineMaker(RecordMarks.multiLine,IndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabified: (colorSet: ColorSet.Type) => Type = multiLineMaker(
	RecordMarks.multiLine,
	IndentMode.tab
);

/**
 * Alias for `multiLineMaker(RecordMarks.none,IndentMode.tree)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeified: (colorSet: ColorSet.Type) => Type = multiLineMaker(
	RecordMarks.none,
	IndentMode.tree
);

/**
 * Calls `singleLine` if the number of properties to print is less than or equal to `limit`. Calls
 * `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnConstituentNumberMaker =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multiLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'SplitWhenConstituentNumberExceeds' +
				limit +
				'With' +
				String.capitalize(singleLineRecordMarks.name) +
				'And' +
				String.capitalize(multiLinesRecordMarks.name) +
				'And' +
				String.capitalize(indentMode.name),
			action: (value) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(Array.length, Number.lessThanOrEqualTo(limit)),
						singleLineMaker(singleLineRecordMarks)(colorSet).action(value)
					),
					MMatch.orElse(multiLineMaker(multiLinesRecordMarks, indentMode)(colorSet).action(value))
				)
		});

/**
 * Alias for
 * `splitOnConstituentNumberMaker(RecordMarks.singleLine,RecordMarks.multiLine,IndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnConstituentNumber: (limit: number) => (colorSet: ColorSet.Type) => Type =
	splitOnConstituentNumberMaker(RecordMarks.singleLine, RecordMarks.multiLine, IndentMode.tab);

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters and record marks) is less than or equal to `limit`. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnTotalLengthMaker =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multiLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'SplitWhenTotalLengthExceeds' +
				limit +
				'With' +
				String.capitalize(singleLineRecordMarks.name) +
				'And' +
				String.capitalize(multiLinesRecordMarks.name) +
				'And' +
				String.capitalize(indentMode.name),
			action: (value) =>
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
						singleLineMaker(singleLineRecordMarks)(colorSet).action(value)
					),
					MMatch.orElse(multiLineMaker(multiLinesRecordMarks, indentMode)(colorSet).action(value))
				)
		});

/**
 * Alias for `splitOnTotalLengthMaker(RecordMarks.singleLine,RecordMarks.multiLine,IndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnTotalLength: (limit: number) => (colorSet: ColorSet.Type) => Type =
	splitOnTotalLengthMaker(RecordMarks.singleLine, RecordMarks.multiLine, IndentMode.tab);

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters and record marks) is less than or equal to `limit`. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnLongestPropLengthMaker =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multiLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(limit: number) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'SplitWhenLongestPropLengthExceeds' +
				limit +
				'With' +
				String.capitalize(singleLineRecordMarks.name) +
				'And' +
				String.capitalize(multiLinesRecordMarks.name) +
				'And' +
				String.capitalize(indentMode.name),
			action: (value) =>
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
						singleLineMaker(singleLineRecordMarks)(colorSet).action(value)
					),
					MMatch.orElse(multiLineMaker(multiLinesRecordMarks, indentMode)(colorSet).action(value))
				)
		});

/**
 * Alias for
 * `splitOnLongestPropLengthMaker(RecordMarks.singleLine,RecordMarks.multiLine,IndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnLongestPropLength: (limit: number) => (colorSet: ColorSet.Type) => Type =
	splitOnLongestPropLengthMaker(RecordMarks.singleLine, RecordMarks.multiLine, IndentMode.tab);

/**
 * Calls `singleLine` for arrays and multiLine for other records. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitNonArraysMaker =
	(
		singleLineRecordMarks: RecordMarks.Type,
		multiLinesRecordMarks: RecordMarks.Type,
		indentMode: IndentMode.Type
	) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'SplitNonArraysWith' +
				String.capitalize(singleLineRecordMarks.name) +
				'And' +
				String.capitalize(multiLinesRecordMarks.name) +
				'And' +
				String.capitalize(indentMode.name),
			action: (value) =>
				pipe(
					value,
					MMatch.make,
					MMatch.when(
						flow(Struct.get('value'), MTypes.isArray),
						singleLineMaker(singleLineRecordMarks)(colorSet).action
					),
					MMatch.orElse(multiLineMaker(multiLinesRecordMarks, indentMode)(colorSet).action)
				)
		});

/**
 * Alias for `splitNonArraysMaker(RecordMarks.singleLine,RecordMarks.multiLine,IndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitNonArrays: (colorSet: ColorSet.Type) => Type = splitNonArraysMaker(
	RecordMarks.singleLine,
	RecordMarks.multiLine,
	IndentMode.tab
);
