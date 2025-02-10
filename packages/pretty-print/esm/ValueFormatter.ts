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
	Either,
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
import type * as PPOption from './Option.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/ValueFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a ValueFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action. The action takes as input a ValueBasedFormatterConstructor (see Option.ts),
	 * a MarkShowerConstructor (see Option.ts), the Value (see Value.ts) being currently printed, and
	 * the stringified representation of that value (see StringifiedValue.ts) . Based on these four
	 * parameters, it must return a stringified representation of the whole property.
	 *
	 * @category Models
	 */
	export interface Type {
		(
			this: PPOption.NonPrimitive.Initialized.Type,
			{
				valueBasedFormatterConstructor,
				markShowerConstructor
			}: {
				readonly valueBasedFormatterConstructor: PPOption.ValueBasedFormatterConstructor.Type;
				readonly markShowerConstructor: PPOption.MarkShowerConstructor.Type;
			}
		): MTypes.OneArgFunction<PPValue.All, MTypes.OneArgFunction<PPStringifiedValue.Type>>;
	}
}

/**
 * Type that represents a ValueFormatter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this ValueFormatter instance. Useful for equality and debugging */
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
 * ValueFormatter equivalence
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
	Object.assign(MFunction.copy(action), {
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
 * ValueFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @category Instances
 */
export const valueOnly: Type = make({
	id: 'ValueOnly',
	action: () => (_value) => Function.identity
});

/**
 * ValueFormatter instance that prints the key and value of a property (similar to the usual way a
 * record is printed). A mark can be prepended or appended to the key to show if the property comes
 * from the object itself or from one of its prototypes.
 *
 * @category Instances
 */
export const keyAndValue: Type = make({
	id: 'KeyAndValue',
	action: function (this, { valueBasedFormatterConstructor }) {
		const propertyKeyTextFormatter = valueBasedFormatterConstructor('PropertyKey');
		const prototypeDelimitersTextFormatter = valueBasedFormatterConstructor('PrototypeDelimiters');
		const KeyValueSeparatorTextFormatter = valueBasedFormatterConstructor('KeyValueSeparator');

		return (value) => {
			const stringKey = value.stringKey;

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
				PPStringifiedValue.prependToFirstLine(
					pipe(
						this.prototypeStartDelimiterMark,
						inContextPrototypeDelimitersTextFormatter,
						ASText.repeat(value.protoDepth)
					)
				),
				PPStringifiedValue.appendToLastLine(
					pipe(
						this.prototypeEndDelimiterMark,
						inContextPrototypeDelimitersTextFormatter,
						ASText.repeat(value.protoDepth)
					)
				)
			);

			return (stringifiedValue) => {
				const firstLine = Array.headNonEmpty(stringifiedValue);

				return pipe(
					key,
					Array.initNonEmpty,
					Array.append(
						pipe(
							// cannot be an empty string
							Array.lastNonEmpty(key),
							ASText.append(ASText.isEmpty(firstLine) ? ASText.empty : keyValueSeparator),
							ASText.append(firstLine)
						)
					),
					Array.appendAll(Array.tailNonEmpty(stringifiedValue))
				);
			};
		};
	}
});

/**
 * ValueFormatter instance that calls `valueOnly` for Value's whose key was autogenerated,
 * `keyAndValue` otherwise.
 *
 * @category Instances
 */
export const valueForAutoGenerated: Type = make({
	id: 'valueForAutoGenerated',
	action: function (this, params) {
		const initializedValueOnly = valueOnly.call(this, params);
		const initializedKeyAndValue = keyAndValue.call(this, params);
		return flow(
			Either.liftPredicate(PPValue.autogeneratedKey, Function.identity),
			Either.mapBoth({ onRight: initializedValueOnly, onLeft: initializedKeyAndValue }),
			Either.merge
		);
	}
});
