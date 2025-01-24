/**
 * This module implements a type that takes care of the formatting of records. From the stringified
 * representation of the properties of a record which it receives, it must return the stringified
 * representation of the whole record. It can take care of aspects like printing on a single or
 * multiple lines, indentation when printing on multiple lines, adding specific array/object
 * marks,...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Number,
	Order,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPIndentMode from './IndentMode.js';
import * as PPStringifiedProperties from './StringifiedProperties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import type * as PPStringifier from './Stringifier.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/RecordFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a RecordFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action of a RecordFormatter. The action takes as input a TextFormatterBuilder, a
	 * MarkShowerBuilder (see OptionAndPrecalc.ts), the Value being currently printed (see Value.ts)
	 * and an array of the stringified properties (see StringifiedProperties.ts). Based on these
	 * parameters, it must return a stringified representation of the whole record.
	 */
	export interface Type {
		(
			textFormatterBuilder: PPStringifier.TextFormatterBuilder.Type,
			markShowerBuilder: PPStringifier.MarkShowerBuilder.Type
		): (
			value: PPValue.NonPrimitiveType,
			children: PPStringifiedProperties.Type
		) => PPStringifiedValue.Type;
	}
}

/**
 * Type that represents a RecordFormatter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this RecordFormatter instance. Useful for equality and debugging */
	readonly id: string;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Base */
const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
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
 * @category Constructors
 */
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
	Object.assign(action.bind({}), {
		id,
		...base
	});

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * RecordFormatter instance that will always print records on a single line
 *
 * @category Instances
 */
export const singleLine: Type = make({
	id: 'SingleLine',
	action: (_textFormatterBuilder, markShowerBuilder) => {
		const singleLineInBetweenPropertySeparatorMarkShower = markShowerBuilder(
			'singleLineInBetweenPropertySeparator'
		);
		const singleLineArrayStartDelimiterMarkShower = markShowerBuilder(
			'singleLineArrayStartDelimiter'
		);
		const singleLineArrayEndDelimiterMarkShower = markShowerBuilder('singleLineArrayEndDelimiter');
		const singleLineRecordStartDelimiterMarkShower = markShowerBuilder(
			'singleLineRecordStartDelimiter'
		);
		const singleLineRecordEndDelimiterMarkShower = markShowerBuilder(
			'singleLineRecordEndDelimiter'
		);

		return (value, stringifiedProperties) =>
			pipe(
				stringifiedProperties,
				PPStringifiedProperties.addMarkInBetween(
					singleLineInBetweenPropertySeparatorMarkShower(value)
				),
				PPStringifiedValue.fromStringifiedProperties,
				pipe(
					value,
					MMatch.make,
					MMatch.when(
						PPValue.isArray,
						Function.constant(
							flow(
								PPStringifiedValue.addStartMark(singleLineArrayStartDelimiterMarkShower(value)),
								PPStringifiedValue.addEndMark(singleLineArrayEndDelimiterMarkShower(value))
							)
						)
					),
					MMatch.orElse(
						Function.constant(
							flow(
								PPStringifiedValue.addStartMark(singleLineRecordStartDelimiterMarkShower(value)),
								PPStringifiedValue.addEndMark(singleLineRecordEndDelimiterMarkShower(value))
							)
						)
					)
				),
				PPStringifiedValue.toSingleLine
			);
	}
});

/**
 * Function that returns a RecordFormatter instance that will always print records on multiple lines
 *
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
 * @category Instances
 */
export const tabified: (formatSet: PPFormatSet.Type) => Type = multiLineMaker(
	PPRecordMarks.multiLine,
	PPIndentMode.tab
);

/**
 * Alias for `multiLineMaker(PPRecordMarks.none,PPIndentMode.tree)`
 *
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
 * @category Instances
 */
export const splitOnTotalLength: (limit: number) => (formatSet: PPFormatSet.Type) => Type =
	splitOnTotalLengthMaker(PPRecordMarks.singleLine, PPRecordMarks.multiLine, PPIndentMode.tab);

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters and record marks) is less than or equal to `limit`. Calls `multiLine` otherwise
 *
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
 * @category Instances
 */
export const splitNonArrays: (formatSet: PPFormatSet.Type) => Type = splitNonArraysMaker(
	PPRecordMarks.singleLine,
	PPRecordMarks.multiLine,
	PPIndentMode.tab
);
