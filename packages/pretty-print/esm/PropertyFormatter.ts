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
	Boolean,
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
import * as PPOptionAndPrecalc from './OptionAndPrecalc.js';
import * as PPStringifiedValue from './StringifiedValue.js';
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
	 * Type of the action. The action takes as input a TextFormatterBuilder and a MarkShowerBuilder
	 * (see OptionAndPrecalc.ts), the Value (see Value.ts) being currently printed, and the
	 * stringified representation of that value (see StringifiedValue.ts) . Based on these three
	 * parameters, it must return a stringified representation of the whole property.
	 *
	 * @category Models
	 */
	export interface Type {
		(
			textFormatterBuilder: PPOptionAndPrecalc.TextFormatterBuilder.Type,
			markShowerBuilder: PPOptionAndPrecalc.MarkShowerBuilder.Type
		): MTypes.OneArgFunction<PPValue.All, MTypes.OneArgFunction<PPStringifiedValue.Type>>;
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

		return (value) => {
			const inContextPrototypeStartDelimiterMarkShower = prototypeStartDelimiterMarkShower(value);
			const inContextPrototypeEndDelimiterMarkShower = prototypeEndDelimiterMarkShower(value);

			return (stringifiedValue) =>
				pipe(
					value,
					Option.liftPredicate(PPValue.belongsToRecord),
					Option.map(
						flow(
							MMatch.make,
							MMatch.when(
								PPValue.isFunction,
								flow(PPValue.stringKey, propertyKeyWhenFunctionValueTextFormatter(value))
							),
							MMatch.when(
								PPValue.hasSymbolicKey,
								flow(PPValue.stringKey, propertyKeyWhenSymbolTextFormatter(value))
							),
							MMatch.orElse(flow(PPValue.stringKey, propertyKeyWhenOtherTextFormatter(value))),
							ASText.prepend(
								pipe(inContextPrototypeStartDelimiterMarkShower, ASText.repeat(value.protoDepth))
							),
							ASText.append(
								pipe(inContextPrototypeEndDelimiterMarkShower, ASText.repeat(value.protoDepth))
							)
						)
					),
					Option.match({
						onNone: Function.constant(stringifiedValue),
						onSome: (key) =>
							pipe(
								stringifiedValue,
								PPStringifiedValue.isEmpty,
								Boolean.match({
									onFalse: Array.modifyNonEmptyHead(ASText.prepend(key)),
									onTrue: () => key
								})
							)
					})
				);
		};
	}
});

/**
 * Alias for `keyAndValue(PPPropertyMarks.objectMarks)`
 *
 * @category Instances
 */
export const keyAndValueWithObjectMarks: (formatSet: PPFormatSet.Type) => Type = keyAndValue(
	PPPropertyMarks.object
);

/**
 * PropertyFormatter instance that uses the `valueOnly` instance for arrays and the `keyAndValue`
 * instance for other records. In the second case, uses the `propertyMarks` and `formatSet` passed
 * as parameter
 *
 * @category Utils
 */
export const valueForArraysKeyAndValueForOthers =
	(propertyMarks: PPPropertyMarks.Type) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id: formatSet.id + 'ValueForArraysKeyAndValueWith' + propertyMarks.id + 'ForOthers',
			action: (value) =>
				pipe(
					value,
					MMatch.make,
					MMatch.when(Struct.get('belongsToArray'), valueOnly.action),
					MMatch.orElse(keyAndValue(propertyMarks)(formatSet).action)
				)
		});

/**
 * Alias for `valueForArraysKeyAndValueForOthers(PPPropertyMarks.objectMarks)`
 *
 * @category Instances
 */
export const recordLike: (formatSet: PPFormatSet.Type) => Type = valueForArraysKeyAndValueForOthers(
	PPPropertyMarks.object
);
