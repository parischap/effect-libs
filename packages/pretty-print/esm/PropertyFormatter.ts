/**
 * This module implements a type that takes care of the stringification of the properties of a
 * non-primitive value. From the stringified representation of the value of a property which it
 * receives, it must return the stringified representation of the whole property (key and value).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import { MFunction, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import type * as PPOption from './Option.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';
import * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/pretty-print/PropertyFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a PropertyFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Namespace of an initialized PropertyFormatter used as an action
	 *
	 * @category Models
	 */
	export namespace Initialized {
		/**
		 * Type of the action. The action takes as input the Value (see Value.ts) being currently
		 * printed, a boolean that indicates if the value is a leaf (i.e. it could be stringified
		 * without stringifying each of its properties) and the stringified representation of that value
		 * (see StringifiedValue.ts) . Based on these two parameters, it must return a stringified
		 * representation of the whole property.
		 *
		 * @category Models
		 */
		export interface Type {
			({
				value,
				isLeaf
			}: {
				readonly value: PPValue.All;
				readonly isLeaf: boolean;
			}): MTypes.OneArgFunction<PPStringifiedValue.Type>;
		}
	}

	/**
	 * Type of the action. The action takes as input a ValueBasedStylerConstructor (see
	 * ValueBasedStylerConstructor.ts), a MarkShowerConstructor (see MarkShowerConstructor.ts). Based
	 * on these two parameters, it must return an Initialized Action.
	 *
	 * @category Models
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
 * Type that represents a PropertyFormatter.
 *
 * @category Models
 */
export interface Type extends Action.Type, Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Id of this PropertyFormatter instance. Useful for equality and debugging */
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
 * PropertyFormatter equivalence
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
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @category Instances
 */
export const valueOnly: Type = make({
	id: 'ValueOnly',
	action: () => () => Function.identity
});

/* if onSameLine=false and isLeaf=false , the lines of the value are appended to the lines of the key and no keyValueSeparator is used. In all other cases, the last line of the key and the first line of the value are merged and separated by the keyValueSeparator. */
const _keyAndValueAction = ({
	onSameLine,
	dontShowLeafValue
}: {
	readonly onSameLine: boolean;
	readonly dontShowLeafValue: boolean;
}): Action.Type =>
	function (this, { valueBasedStylerConstructor }) {
		const propertyKeyTextFormatter = valueBasedStylerConstructor('PropertyKey');
		const prototypeDelimitersTextFormatter = valueBasedStylerConstructor('PrototypeDelimiters');
		const KeyValueSeparatorTextFormatter = valueBasedStylerConstructor('KeyValueSeparator');

		return ({ value, isLeaf }) => {
			const stringKey = value.stringKey;
			const protoDepth = value.protoDepth;

			if (MTypes.isSingleton(stringKey) && String.isEmpty(stringKey[0])) return Function.identity;
			const inContextPropertyKeyTextFormatter = propertyKeyTextFormatter(value);
			const inContextPrototypeDelimitersTextFormatter = prototypeDelimitersTextFormatter(value);

			const keyValueSeparator = pipe(
				this.keyValueSeparatorMark,
				KeyValueSeparatorTextFormatter(value)
			);

			const key: PPStringifiedValue.Type = pipe(
				stringKey,
				Array.map((line, _i) => inContextPropertyKeyTextFormatter(line)),
				MFunction.fIfTrue({
					condition: protoDepth > 0,
					f: flow(
						PPStringifiedValue.prependToFirstLine(
							pipe(
								this.prototypeStartDelimiterMark,
								inContextPrototypeDelimitersTextFormatter,
								ASText.repeat(protoDepth)
							)
						),
						PPStringifiedValue.appendToLastLine(
							pipe(
								this.prototypeEndDelimiterMark,
								inContextPrototypeDelimitersTextFormatter,
								ASText.repeat(protoDepth)
							)
						)
					)
				})
			);

			return (stringifiedValue) => {
				if (!onSameLine && !isLeaf) return pipe(key, Array.appendAll(stringifiedValue));

				const firstLine = Array.headNonEmpty(stringifiedValue);
				const showValue = !isLeaf || !dontShowLeafValue;

				return pipe(
					key,
					Array.initNonEmpty,
					Array.append(
						pipe(
							key,
							// cannot be an empty string
							Array.lastNonEmpty,
							MFunction.fIfTrue({
								condition: showValue && ASText.isNotEmpty(firstLine),
								f: flow(ASText.append(keyValueSeparator), ASText.append(firstLine))
							})
						)
					),
					MFunction.fIfTrue({
						condition: showValue,
						f: Array.appendAll(Array.tailNonEmpty(stringifiedValue))
					})
				);
			};
		};
	};

/**
 * PropertyFormatter instance that prints the key and value of a property (similar to the usual way
 * a record is printed). A mark can be prepended or appended to the key to show if the property
 * comes from the object itself or from one of its prototypes.
 *
 * @category Instances
 */
export const keyAndValue: Type = make({
	id: 'KeyAndValue',
	action: _keyAndValueAction({ onSameLine: true, dontShowLeafValue: false })
});

/**
 * PropertyFormatter instance that :
 *
 * - For a leaf: does the same as keyAndValue
 * - For a non-leaf: prints the key and value on separate lines without any key/value separator
 *
 * @category Instances
 */
export const treeify: Type = make({
	id: 'Treeify',
	action: _keyAndValueAction({ onSameLine: false, dontShowLeafValue: false })
});

/**
 * PropertyFormatter instance that :
 *
 * - For a leaf: prints only the key
 * - For a non-leaf: prints the key and value on separate lines without any key/value separator
 *
 * @category Instances
 */
export const treeifyHideLeafValues: Type = make({
	id: 'Treeify',
	action: _keyAndValueAction({ onSameLine: false, dontShowLeafValue: true })
});
