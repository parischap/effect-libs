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
	Hash,
	Number,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
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
			value: PPValue.NonPrimitiveType
		) => (children: PPStringifiedProperties.Type) => PPStringifiedValue.Type;
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
		const addNonPrimitiveMarks = PPStringifiedValue.addNonPrimitiveMarks({
			arrayStartDelimiterMarkShower: markShowerBuilder('singleLineArrayStartDelimiter'),
			arrayEndDelimiterMarkShower: markShowerBuilder('singleLineArrayEndDelimiter'),
			recordStartDelimiterMarkShower: markShowerBuilder('singleLineRecordStartDelimiter'),
			recordEndDelimiterMarkShower: markShowerBuilder('singleLineRecordEndDelimiter')
		});

		return (value) =>
			flow(
				PPStringifiedProperties.addMarkInBetween(
					singleLineInBetweenPropertySeparatorMarkShower(value)
				),
				PPStringifiedValue.fromStringifiedProperties,
				addNonPrimitiveMarks(value),
				PPStringifiedValue.toSingleLine
			);
	}
});

/**
 * RecordFormatter instance that will always print records on multiple lines with a tab indentation
 *
 * @category Instances
 */
export const tabify: Type = make({
	id: 'Tabified',
	action: (_textFormatterBuilder, markShowerBuilder) => {
		const multiLineInBetweenPropertySeparatorMarkShower = markShowerBuilder(
			'multiLineInBetweenPropertySeparator'
		);

		const tabIndentMarkShower = markShowerBuilder('tabIndent');
		const addNonPrimitiveMarks = PPStringifiedValue.addNonPrimitiveMarks({
			arrayStartDelimiterMarkShower: markShowerBuilder('multiLineArrayStartDelimiter'),
			arrayEndDelimiterMarkShower: markShowerBuilder('multiLineArrayEndDelimiter'),
			recordStartDelimiterMarkShower: markShowerBuilder('multiLineRecordStartDelimiter'),
			recordEndDelimiterMarkShower: markShowerBuilder('multiLineRecordEndDelimiter')
		});

		return (value) =>
			flow(
				PPStringifiedProperties.addMarkInBetween(
					multiLineInBetweenPropertySeparatorMarkShower(value)
				),
				PPStringifiedProperties.tabify(tabIndentMarkShower(value)),
				PPStringifiedValue.fromStringifiedProperties,
				addNonPrimitiveMarks(value),
				PPStringifiedValue.toSingleLine
			);
	}
});

/**
 * Calls `singleLine` for arrays, `tabify` otherwise
 *
 * @category Instances
 */
export const splitNonArraysMaker: Type = make({
	id: 'SplitNonArrays',
	action: (textFormatterBuilder, markShowerBuilder) => {
		const initializedSingleLine = singleLine(textFormatterBuilder, markShowerBuilder);
		const initilizedTabify = tabify(textFormatterBuilder, markShowerBuilder);
		return (value) =>
			PPValue.isArray(value) ? initializedSingleLine(value) : initilizedTabify(value);
	}
});

/**
 * RecordFormatter instance that will always print records in a tree-like fashion
 *
 * @category Instances
 */
export const treeify: Type = make({
	id: 'Treeified',
	action: (_textFormatterBuilder, markShowerBuilder) => {
		const treeIndentForFirstLineOfInitPropsMarkShower = markShowerBuilder(
			'treeIndentForFirstLineOfInitProps'
		);
		const treeIndentForTailLinesOfInitPropsMarkShower = markShowerBuilder(
			'treeIndentForTailLinesOfInitProps'
		);
		const treeIndentForFirstLineOfLastPropMarkShower = markShowerBuilder(
			'treeIndentForFirstLineOfLastProp'
		);
		const treeIndentForTailLinesOfLastPropMarkShower = markShowerBuilder(
			'treeIndentForTailLinesOfLastProp'
		);

		return (value) =>
			flow(
				PPStringifiedProperties.treeify({
					treeIndentForFirstLineOfInitProps: treeIndentForFirstLineOfInitPropsMarkShower(value),
					treeIndentForTailLinesOfInitProps: treeIndentForTailLinesOfInitPropsMarkShower(value),
					treeIndentForFirstLineOfLastProp: treeIndentForFirstLineOfLastPropMarkShower(value),
					treeIndentForTailLinesOfLastProp: treeIndentForTailLinesOfLastPropMarkShower(value)
				}),
				PPStringifiedValue.fromStringifiedProperties
			);
	}
});

/**
 * RecordFormatter instance maker that will print record on a single line if the number of their
 * constituents is less than or equal to `limit`.
 *
 * @category Constructors
 */
export const splitOnConstituentNumberMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenConstituentNumberExceeds' + limit,
		action: (textFormatterBuilder, markShowerBuilder) => {
			const initializedSingleLine = singleLine(textFormatterBuilder, markShowerBuilder);
			const initilizedTabify = tabify(textFormatterBuilder, markShowerBuilder);
			return (value) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(Array.length, Number.lessThanOrEqualTo(limit)),
						initializedSingleLine(value)
					),
					MMatch.orElse(initilizedTabify(value))
				);
		}
	});

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters and object marks) is less than or equal to `limit`. Calls `tabify` otherwise
 *
 * @category Instances
 */
export const splitOnTotalLengthMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenTotalLengthExceeds' + limit,
		action: (textFormatterBuilder, markShowerBuilder) => {
			const initializedSingleLine = singleLine(textFormatterBuilder, markShowerBuilder);
			const initilizedTabify = tabify(textFormatterBuilder, markShowerBuilder);
			return (value) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(PPStringifiedProperties.length, Number.lessThanOrEqualTo(limit)),
						initializedSingleLine(value)
					),
					MMatch.orElse(initilizedTabify(value))
				);
		}
	});

/**
 * Calls `singleLine` if the length of the longest property to print (excluding formatting
 * characters and object marks) is less than or equal to `limit`. Calls `tabify` otherwise
 *
 * @category Constructors
 */
export const splitOnLongestPropLengthMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenLongestPropLengthExceeds' + limit,
		action: (textFormatterBuilder, markShowerBuilder) => {
			const initializedSingleLine = singleLine(textFormatterBuilder, markShowerBuilder);
			const initilizedTabify = tabify(textFormatterBuilder, markShowerBuilder);
			return (value) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(PPStringifiedProperties.longestPropLength, Number.lessThanOrEqualTo(limit)),
						initializedSingleLine(value)
					),
					MMatch.orElse(initilizedTabify(value))
				);
		}
	});
