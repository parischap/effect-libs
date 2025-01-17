/**
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
	Number,
	Order,
	pipe,
	Pipeable,
	Predicate
} from 'effect';
import * as PPFormatWheel from './FormatWheel.js';
import * as PPIndentMode from './IndentMode.js';
import * as PPRecordMarks from './RecordMarks.js';
import * as PPString from './String.js';
import * as PPStringifiedValue from './Stringified.js';
import * as PPStringifiedValues from './StringifiedProperties.js';
import type * as PPFormatSet from './StyleMap.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/RecordFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of the action of a RecordFormatter. `value` is the Value (see Value.ts) representing a
 * record and stringifiedProps is an array of the stringified representations of the properties of
 * that record (see Stringified.ts). Based on these two parameters, it must return a stringified
 * representation of the whole record.
 */
interface ActionType {
	(stringifiedProps: PPStringifiedValues.Type): (value: PPValue.All) => PPStringifiedValue.Type;
}

/**
 * Type that represents a RecordFormatter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this RecordFormatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

	/**
	 * Action of this RecordFormatter.
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType;
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
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `action` of `self`
 *
 * @since 0.3.0
 * @category Destructors
 */
export const action = (self: Type): ActionType => self.action;

/**
 * Function that returns a RecordFormatter instance that will always print records on a single line
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLineMaker =
	(recordMarks: PPRecordMarks.Type) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id: formatSet.id + 'SingleLineWith' + recordMarks.id,
			action: (stringifiedProps) => (value) =>
				pipe(
					stringifiedProps,
					PPStringifiedValues.addSeparatorBetweenProps(
						recordMarks.propertySeparator,
						formatSet.propertySeparatorFormatter
					),
					Array.flatten,
					PPStringifiedValue.addExtremityMarks(
						pipe(
							value,
							MMatch.make,
							MMatch.when(PPValue.isArray, () => recordMarks.arrayMarks),
							MMatch.orElse(() => recordMarks.objectMarks)
						),
						pipe(formatSet.recordDelimitersFormatWheel, PPFormatWheel.getFormat(value.depth))
					),
					PPStringifiedValue.toSingleLine
				)
		});

/**
 * Alias for `singleLineMaker(PPRecordMarks.singleLine)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine: (formatSet: PPFormatSet.Type) => Type = singleLineMaker(
	PPRecordMarks.singleLine
);

/**
 * Function that returns a RecordFormatter instance that will always print records on multiple lines
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLineMaker =
	(recordMarks: PPRecordMarks.Type, indentMode: PPIndentMode.Type) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id: formatSet.id + 'MultiLineWith' + recordMarks.id + 'And' + indentMode.id,
			action: (stringifiedProps) => (value) =>
				pipe(
					stringifiedProps,
					PPStringifiedValues.addSeparatorBetweenProps(
						recordMarks.propertySeparator,
						formatSet.propertySeparatorFormatter
					),
					PPStringifiedValues.indentProps(indentMode, formatSet.multiLineIndentFormatter),
					Array.flatten,
					PPStringifiedValue.addExtremityMarks(
						pipe(
							value,
							MMatch.make,
							MMatch.when(PPValue.isArray, () => recordMarks.arrayMarks),
							MMatch.orElse(() => recordMarks.objectMarks)
						),
						pipe(formatSet.recordDelimitersFormatWheel, PPFormatWheel.getFormat(value.depth))
					)
				)
		});

/**
 * Alias for `multiLineMaker(PPRecordMarks.multiLine,PPIndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabified: (formatSet: PPFormatSet.Type) => Type = multiLineMaker(
	PPRecordMarks.multiLine,
	PPIndentMode.tab
);

/**
 * Alias for `multiLineMaker(PPRecordMarks.none,PPIndentMode.tree)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeified: (formatSet: PPFormatSet.Type) => Type = multiLineMaker(
	PPRecordMarks.none,
	PPIndentMode.tree
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
		singleLineRecordMarks: PPRecordMarks.Type,
		multiLinesRecordMarks: PPRecordMarks.Type,
		indentMode: PPIndentMode.Type
	) =>
	(limit: number) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id:
				formatSet.id +
				'SplitWhenConstituentNumberExceeds' +
				limit +
				'With' +
				singleLineRecordMarks.id +
				'And' +
				multiLinesRecordMarks.id +
				'And' +
				indentMode.id,
			action: flow(
				MMatch.make,
				MMatch.when(
					flow(Array.length, Number.lessThanOrEqualTo(limit)),
					pipe(formatSet, singleLineMaker(singleLineRecordMarks), action)
				),
				MMatch.orElse(pipe(formatSet, multiLineMaker(multiLinesRecordMarks, indentMode), action))
			)
		});

/**
 * Alias for
 * `splitOnConstituentNumberMaker(PPRecordMarks.singleLine,PPRecordMarks.multiLine,PPIndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnConstituentNumber: (limit: number) => (formatSet: PPFormatSet.Type) => Type =
	splitOnConstituentNumberMaker(
		PPRecordMarks.singleLine,
		PPRecordMarks.multiLine,
		PPIndentMode.tab
	);

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters and record marks) is less than or equal to `limit`. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnTotalLengthMaker =
	(
		singleLineRecordMarks: PPRecordMarks.Type,
		multiLinesRecordMarks: PPRecordMarks.Type,
		indentMode: PPIndentMode.Type
	) =>
	(limit: number) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id:
				formatSet.id +
				'SplitWhenTotalLengthExceeds' +
				limit +
				'With' +
				singleLineRecordMarks.id +
				'And' +
				multiLinesRecordMarks.id +
				'And' +
				indentMode.id,
			action: flow(
				MMatch.make,
				MMatch.when(
					flow(
						Array.map(flow(Array.map(PPString.printedLength), Number.sumAll)),
						Number.sumAll,
						Number.lessThanOrEqualTo(limit)
					),
					pipe(formatSet, singleLineMaker(singleLineRecordMarks), action)
				),
				MMatch.orElse(pipe(formatSet, multiLineMaker(multiLinesRecordMarks, indentMode), action))
			)
		});

/**
 * Alias for
 * `splitOnTotalLengthMaker(PPRecordMarks.singleLine,PPRecordMarks.multiLine,PPIndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnTotalLength: (limit: number) => (formatSet: PPFormatSet.Type) => Type =
	splitOnTotalLengthMaker(PPRecordMarks.singleLine, PPRecordMarks.multiLine, PPIndentMode.tab);

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters and record marks) is less than or equal to `limit`. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnLongestPropLengthMaker =
	(
		singleLineRecordMarks: PPRecordMarks.Type,
		multiLinesRecordMarks: PPRecordMarks.Type,
		indentMode: PPIndentMode.Type
	) =>
	(limit: number) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id:
				formatSet.id +
				'SplitWhenLongestPropLengthExceeds' +
				limit +
				'With' +
				singleLineRecordMarks.id +
				'And' +
				multiLinesRecordMarks.id +
				'And' +
				indentMode.id,
			action: flow(
				MMatch.make,
				MMatch.when(
					flow(
						Array.map(flow(Array.map(PPString.printedLength), Number.sumAll)),
						Array.match({
							onEmpty: () => false,
							onNonEmpty: flow(Array.max(Order.number), Number.lessThanOrEqualTo(limit))
						})
					),
					pipe(formatSet, singleLineMaker(singleLineRecordMarks), action)
				),
				MMatch.orElse(pipe(formatSet, multiLineMaker(multiLinesRecordMarks, indentMode), action))
			)
		});

/**
 * Alias for
 * `splitOnLongestPropLengthMaker(PPRecordMarks.singleLine,PPRecordMarks.multiLine,PPIndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitOnLongestPropLength: (limit: number) => (formatSet: PPFormatSet.Type) => Type =
	splitOnLongestPropLengthMaker(
		PPRecordMarks.singleLine,
		PPRecordMarks.multiLine,
		PPIndentMode.tab
	);

/**
 * Calls `singleLine` for arrays and multiLine for other records. Calls `multiLine` otherwise
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitNonArraysMaker =
	(
		singleLineRecordMarks: PPRecordMarks.Type,
		multiLinesRecordMarks: PPRecordMarks.Type,
		indentMode: PPIndentMode.Type
	) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id:
				formatSet.id +
				'SplitNonArraysWith' +
				singleLineRecordMarks.id +
				'And' +
				multiLinesRecordMarks.id +
				'And' +
				indentMode.id,
			action: (stringifiedProps) =>
				flow(
					MMatch.make,
					MMatch.when(
						PPValue.isArray,
						pipe(formatSet, singleLineMaker(singleLineRecordMarks), action)(stringifiedProps)
					),
					MMatch.orElse(
						pipe(
							formatSet,
							multiLineMaker(multiLinesRecordMarks, indentMode),
							action
						)(stringifiedProps)
					)
				)
		});

/**
 * Alias for
 * `splitNonArraysMaker(PPRecordMarks.singleLine,PPRecordMarks.multiLine,PPIndentMode.tab)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitNonArrays: (formatSet: PPFormatSet.Type) => Type = splitNonArraysMaker(
	PPRecordMarks.singleLine,
	PPRecordMarks.multiLine,
	PPIndentMode.tab
);
