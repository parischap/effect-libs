/**
 * This module implements a type that takes care of the formatting of non primitive values. From the
 * stringified representation of the properties of a non-primitive value which it receives, it must
 * return the stringified representation of the whole non-primitive value. It can take care of
 * aspects like printing on a single or multiple lines, indentation when printing on multiple lines,
 * adding specific array/object marks,...
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
import type * as PPOption from './Option.js';
import * as PPStringifiedProperties from './StringifiedProperties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/NonPrimitiveFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a NonPrimitiveFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action of a NonPrimitiveFormatter. The action takes as input a
	 * ValueBasedFormatterConstructor, a MarkShowerConstructor (see OptionAndPrecalc.ts), the Value
	 * being currently printed (see Value.ts) and an array of the stringified properties (see
	 * StringifiedProperties.ts) of that value. Based on these parameters, it must return a
	 * stringified representation of the whole rescord.
	 */
	export interface Type {
		(
			this: PPOption.NonPrimitive.Type,
			{
				valueBasedFormatterConstructor,
				markShowerConstructor
			}: {
				readonly valueBasedFormatterConstructor: PPOption.ValueBasedFormatterConstructor.Type;
				readonly markShowerConstructor: PPOption.MarkShowerConstructor.Type;
			}
		): (
			value: PPValue.NonPrimitive
		) => (children: PPStringifiedProperties.Type) => PPStringifiedValue.Type;
	}
}

/**
 * Type that represents a NonPrimitiveFormatter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this NonPrimitiveFormatter instance. Useful for equality and debugging */
	readonly id: string;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
 * NonPrimitiveFormatter instance that will always print records on a single line
 *
 * @category Instances
 */
export const singleLine: Type = make({
	id: 'SingleLine',
	action: ({ markShowerConstructor }) => {
		const singleLineInBetweenPropertySeparatorMarkShower = markShowerConstructor(
			'SingleLineInBetweenPropertySeparator'
		);
		const addNonPrimitiveMarks = PPStringifiedValue.addNonPrimitiveMarks({
			arrayStartDelimiterMarkShower: markShowerConstructor('singleLineArrayStartDelimiter'),
			arrayEndDelimiterMarkShower: markShowerConstructor('singleLineArrayEndDelimiter'),
			recordStartDelimiterMarkShower: markShowerConstructor('singleLineRecordStartDelimiter'),
			recordEndDelimiterMarkShower: markShowerConstructor('singleLineRecordEndDelimiter')
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
 * NonPrimitiveFormatter instance that will always print records on multiple lines with a tab
 * indentation
 *
 * @category Instances
 */
export const tabify: Type = make({
	id: 'Tabified',
	action: ({ markShowerConstructor }) => {
		const multiLineInBetweenPropertySeparatorMarkShower = markShowerConstructor(
			'MultiLineInBetweenPropertySeparator'
		);

		const tabIndentMarkShower = markShowerConstructor('TabIndent');
		const addNonPrimitiveMarks = PPStringifiedValue.addNonPrimitiveMarks({
			arrayStartDelimiterMarkShower: markShowerConstructor('multiLineArrayStartDelimiter'),
			arrayEndDelimiterMarkShower: markShowerConstructor('multiLineArrayEndDelimiter'),
			recordStartDelimiterMarkShower: markShowerConstructor('multiLineRecordStartDelimiter'),
			recordEndDelimiterMarkShower: markShowerConstructor('multiLineRecordEndDelimiter')
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
	action: (params) => {
		const initializedSingleLine = singleLine(params);
		const initilizedTabify = tabify(params);
		return (value) =>
			PPValue.isArray(value) ? initializedSingleLine(value) : initilizedTabify(value);
	}
});

/**
 * NonPrimitiveFormatter instance that will always print records in a tree-like fashion
 *
 * @category Instances
 */
export const treeify: Type = make({
	id: 'Treeified',
	action: ({ markShowerConstructor }) => {
		const treeIndentForFirstLineOfInitPropsMarkShower = markShowerConstructor(
			'TreeIndentForFirstLineOfInitProps'
		);
		const treeIndentForTailLinesOfInitPropsMarkShower = markShowerConstructor(
			'TreeIndentForTailLinesOfInitProps'
		);
		const treeIndentForFirstLineOfLastPropMarkShower = markShowerConstructor(
			'TreeIndentForFirstLineOfLastProp'
		);
		const treeIndentForTailLinesOfLastPropMarkShower = markShowerConstructor(
			'TreeIndentForTailLinesOfLastProp'
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
 * NonPrimitiveFormatter instance maker that will print record on a single line if the number of
 * their constituents is less than or equal to `limit`.
 *
 * @category Constructors
 */
export const splitOnConstituentNumberMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenConstituentNumberExceeds' + limit,
		action: (params) => {
			const initializedSingleLine = singleLine(params);
			const initilizedTabify = tabify(params);
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
		action: (params) => {
			const initializedSingleLine = singleLine(params);
			const initilizedTabify = tabify(params);
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
		action: (params) => {
			const initializedSingleLine = singleLine(params);
			const initilizedTabify = tabify(params);
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
