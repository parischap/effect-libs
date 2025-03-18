/**
 * This module implements a type that takes care of the formatting of non-primitive values. From the
 * stringified representation of the properties of a non-primitive value which it receives, it must
 * return the stringified representation of the whole non-primitive value. It can take care of
 * aspects like adding specific array/object marks, printing on a single or multiple lines,
 * indentation when printing on multiple lines, ...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import { MFunction, MInspectable, MMatch, MPipeable, MTuple, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Number,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import type * as PPOption from './Option.js';
import * as PPStringifiedProperties from './StringifiedProperties.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';
import * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/pretty-print/NonPrimitiveFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a NonPrimitiveFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Namespace of an initialized NonPrimitiveFormatter used as an action
	 *
	 * @category Models
	 */
	export namespace Initialized {
		/**
		 * Type of the action of a NonPrimitiveFormatter. The action takes as input the Value being
		 * currently printed (see Value.ts), a header to be displayed in front of the stringified
		 * properties (usually the id of the non primitive value and the number of displayed properties)
		 * and an array of the stringified properties (see StringifiedProperties.ts) of that value.
		 * Based on these parameters, it must return a stringified representation of the whole record.
		 */
		export interface Type {
			({
				value,
				header
			}: {
				readonly value: PPValue.NonPrimitive;
				readonly header: ASText.Type;
			}): (children: PPStringifiedProperties.Type) => PPStringifiedValue.Type;
		}
	}

	/**
	 * Type of the action of a NonPrimitiveFormatter. The action takes as input a
	 * ValueBasedStylerConstructor (see ValueBasedStylerConstructor.ts), a MarkShowerConstructor (see
	 * MarkShowerConstructor.ts). Based on these parameters, it must return an Initialized Action.
	 */
	export interface Type {
		(
			this: PPOption.NonPrimitive.Type,
			{
				valueBasedStylerConstructor,
				markShowerConstructor
			}: {
				readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
				readonly markShowerConstructor: PPMarkShowerConstructor.Type;
			}
		): Initialized.Type;
	}
}

/**
 * Type that represents a NonPrimitiveFormatter.
 *
 * @category Models
 */
export interface Type extends Action.Type, Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
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
	Object.assign(MFunction.clone(action), {
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
 * NonPrimitiveFormatter instance that will always print non-primitive values on a single line
 *
 * @category Instances
 */
export const singleLine: Type = make({
	id: 'SingleLine',
	action: function (this, { valueBasedStylerConstructor }) {
		const inBetweenPropertySeparatorTextFormatter = valueBasedStylerConstructor(
			'InBetweenPropertySeparator'
		);
		const nonPrimitiveValueDelimitersTextFormatter = valueBasedStylerConstructor(
			'NonPrimitiveValueDelimiters'
		);

		return ({ value, header }) => {
			const inBetweenPropertySeparator = pipe(
				this.singleLineInBetweenPropertySeparatorMark,
				inBetweenPropertySeparatorTextFormatter(value)
			);
			const inContextNonPrimitiveValueDelimitersTextFormatter =
				nonPrimitiveValueDelimitersTextFormatter(value);

			return Array.match({
				onEmpty: pipe(
					this.multiLineStartDelimiterMark + this.multiLineEndDelimiterMark,
					inContextNonPrimitiveValueDelimitersTextFormatter,
					ASText.prepend(header),
					PPStringifiedValue.fromText,
					Function.constant
				),
				onNonEmpty: flow(
					PPStringifiedProperties.addMarkInBetween(inBetweenPropertySeparator),
					PPStringifiedProperties.prependProperty(
						pipe(
							this.singleLineStartDelimiterMark,
							inContextNonPrimitiveValueDelimitersTextFormatter,
							ASText.prepend(header)
						)
					),
					PPStringifiedProperties.appendProperty(
						inContextNonPrimitiveValueDelimitersTextFormatter(this.singleLineEndDelimiterMark)
					),
					PPStringifiedValue.fromStringifiedProperties,
					PPStringifiedValue.toSingleLine
				)
			});
		};
	}
});

/**
 * NonPrimitiveFormatter instance that will always print non-primitive values on multiple lines with
 * a tab indentation
 *
 * @category Instances
 */
export const tabify: Type = make({
	id: 'Tabify',
	action: function (this, { valueBasedStylerConstructor, markShowerConstructor }) {
		const inBetweenPropertySeparatorTextFormatter = valueBasedStylerConstructor(
			'InBetweenPropertySeparator'
		);
		const nonPrimitiveValueDelimitersTextFormatter = valueBasedStylerConstructor(
			'NonPrimitiveValueDelimiters'
		);
		const tabIndentMarkShower = markShowerConstructor('TabIndent');

		return ({ value, header }) => {
			const inBetweenPropertySeparator = pipe(
				this.multiLineInBetweenPropertySeparatorMark,
				inBetweenPropertySeparatorTextFormatter(value)
			);
			const inContextNonPrimitiveValueDelimitersTextFormatter =
				nonPrimitiveValueDelimitersTextFormatter(value);
			const startDelimiterMarkAndHeader = pipe(
				this.multiLineStartDelimiterMark,
				inContextNonPrimitiveValueDelimitersTextFormatter,
				ASText.prepend(header)
			);
			const endDelimiterMark = inContextNonPrimitiveValueDelimitersTextFormatter(
				this.multiLineEndDelimiterMark
			);
			const tab = tabIndentMarkShower(value);
			return flow(
				PPStringifiedProperties.addMarkInBetween(inBetweenPropertySeparator),
				PPStringifiedProperties.tabify(tab),
				PPStringifiedProperties.prependProperty(startDelimiterMarkAndHeader),
				PPStringifiedProperties.appendProperty(endDelimiterMark),
				PPStringifiedValue.fromStringifiedProperties
			);
		};
	}
});

/**
 * NonPrimitiveFormatter instance that will always print non-primitive values in a tree-like fashion
 *
 * @category Instances
 */
export const treeify: Type = make({
	id: 'Treeify',
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

		return ({ value }) =>
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
 * NonPrimitiveFormatter instance maker that will print non-primitive values on a single line if the
 * actual number of their constituents (after filtering,...) is less than or equal to `limit`.
 *
 * @category Constructors
 */
export const splitOnConstituentNumberMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenConstituentNumberExceeds' + limit,
		action: function (this, params) {
			const initializedSingleLine = singleLine.call(this, params);
			const initilizedTabify = tabify.call(this, params);
			return ({ value, header }) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(Array.length, Number.lessThanOrEqualTo(limit)),
						initializedSingleLine({ value, header })
					),
					MMatch.orElse(initilizedTabify({ value, header }))
				);
		}
	});

/**
 * Calls `singleLine` if the total length of the properties to print (excluding formatting
 * characters) is less than or equal to `limit`. Calls `tabify` otherwise
 *
 * @category Constructors
 */
export const splitOnTotalLengthMaker = (limit: number): Type =>
	make({
		id: 'SplitWhenTotalLengthExceeds' + limit,
		action: function (this, params) {
			const initializedSingleLine = singleLine.call(this, params);
			const initilizedTabify = tabify.call(this, params);
			const inBetweenSepLength = this.singleLineInBetweenPropertySeparatorMark.length;
			const delimitersLength =
				this.singleLineStartDelimiterMark.length + this.singleLineEndDelimiterMark.length;
			const delimitersLengthWhenEmpty =
				this.multiLineStartDelimiterMark.length + this.multiLineEndDelimiterMark.length;
			return ({ value, header }) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(
							MTuple.makeBothBy({
								toFirst: PPStringifiedProperties.toLength,
								toSecond: Array.match({
									onEmpty: () => ASText.toLength(header) + delimitersLengthWhenEmpty,
									onNonEmpty: flow(
										Array.length,
										Number.decrement,
										Number.multiply(inBetweenSepLength),
										Number.sum(delimitersLength),
										Number.sum(ASText.toLength(header))
									)
								})
							}),
							Number.sumAll,
							Number.lessThanOrEqualTo(limit)
						),
						initializedSingleLine({ value, header })
					),
					MMatch.orElse(initilizedTabify({ value, header }))
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
		action: function (this, params) {
			const initializedSingleLine = singleLine.call(this, params);
			const initilizedTabify = tabify.call(this, params);
			return ({ value, header }) =>
				flow(
					MMatch.make,
					MMatch.when(
						flow(PPStringifiedProperties.toLongestPropLength, Number.lessThanOrEqualTo(limit)),
						initializedSingleLine({ value, header })
					),
					MMatch.orElse(initilizedTabify({ value, header }))
				);
		}
	});
