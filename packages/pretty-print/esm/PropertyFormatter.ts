/**
 * This module implements a type that takes care of the stringification of the properties of a
 * record. From the stringified representation of the value of a property which it receives, it must
 * return the stringified representation of the whole property (key and value).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';

import * as PPStringifiedValue from './StringifiedValue.js';
import type * as PPStringifier from './Stringifier.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/PropertyFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a PropertyFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action. The action takes as input a TextFormatterBuilder, a MarkShowerBuilder (see
	 * OptionAndPrecalc.ts), the Value (see Value.ts) being currently printed, and the stringified
	 * representation of that value (see StringifiedValue.ts) . Based on these three parameters, it
	 * must return a stringified representation of the whole property.
	 *
	 * @category Models
	 */
	export interface Type {
		(
			textFormatterBuilder: PPStringifier.TextFormatterBuilder.Type,
			markShowerBuilder: PPStringifier.MarkShowerBuilder.Type
		): MTypes.OneArgFunction<
			PPValue.NonPrimitiveType,
			MTypes.OneArgFunction<PPStringifiedValue.Type>
		>;
	}
}

/**
 * Type that represents a PropertyFormatter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this PropertyFormatter instance. Useful for equality and debugging */
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
 * PropertyFormatter equivalence
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
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @category Instances
 */
export const valueOnly: Type = make({
	id: 'ValueOnly',
	action: (_textFormatterBuilder, _markShowerBuilder) => (_value) => Function.identity
});

/**
 * PropertyFormatter instance that prints the key and value of a property (similar to the usual way
 * a record is printed). A mark can be prepended or appended to the key to show if the property
 * comes from the object itself or from one of its prototypes.
 *
 * @category Instances
 */
export const keyAndValue: Type = make({
	id: 'KeyAndValue',
	action: (textFormatterBuilder, markShowerBuilder) => {
		const propertyKeyWhenFunctionValueTextFormatter = textFormatterBuilder(
			'propertyKeyWhenFunctionValue'
		);
		const propertyKeyWhenSymbolTextFormatter = textFormatterBuilder('propertyKeyWhenSymbol');
		const propertyKeyWhenOtherTextFormatter = textFormatterBuilder('propertyKeyWhenOther');

		const prototypeStartDelimiterMarkShower = markShowerBuilder('prototypeStartDelimiter');
		const prototypeEndDelimiterMarkShower = markShowerBuilder('prototypeEndDelimiter');
		const keyValueSeparatorMarkShower = markShowerBuilder('keyValueSeparator');

		return (value) =>
			pipe(
				value,
				MMatch.make,
				MMatch.when(PPValue.isFunction, propertyKeyWhenFunctionValueTextFormatter),
				MMatch.when(PPValue.hasSymbolicKey, propertyKeyWhenSymbolTextFormatter),
				MMatch.orElse(propertyKeyWhenOtherTextFormatter),
				Function.apply(value.stringKey),
				ASText.prepend(
					pipe(value, prototypeStartDelimiterMarkShower, ASText.repeat(value.protoDepth))
				),
				ASText.append(
					pipe(value, prototypeEndDelimiterMarkShower, ASText.repeat(value.protoDepth))
				),
				(stringifiedKey) =>
					Array.modifyNonEmptyHead(
						flow(
							Option.liftPredicate(ASText.isNotEmpty),
							Option.map(
								flow(
									ASText.prepend(keyValueSeparatorMarkShower(value)),
									ASText.prepend(stringifiedKey)
								)
							),
							Option.getOrElse(() => stringifiedKey)
						)
					)
			);
	}
});
