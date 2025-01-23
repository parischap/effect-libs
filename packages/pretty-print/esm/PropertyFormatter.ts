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
	 * Type of the action. The first parameter contains the Option instance passed by the user
	 * enriched by some precalced values (see OptionAndPrecalc.ts). The second parameter is the Value
	 * (see Value.ts) being currently displayed. If the action returns a value of type
	 * `Some<StringifiedValue.Type>` or `StringifiedValue.Type`, this `StringifiedValue` will be used
	 * as is to represent the input value. If it returns a `none` or `null` or `undefined`, the normal
	 * stringification process will be applied.
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			PPOptionAndPrecalc.Type,
			MTypes.OneArgFunction<PPValue.All, MTypes.OneArgFunction<PPStringifiedValue.Type>>
		> {}
}

/**
 * Type of the action of this PropertyFormatter. `value` is the Value (see Value.ts) representing a
 * property and `stringified` is the stringified representation of the value of that property (see
 * Stringified.ts). Based on these two parameters, it must return a stringified representation of
 * the whole property.
 */

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
	action: (_optionsAndPrecalc) => (_value) => Function.identity
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
	action: (optionAndPrecalc) => {
		const contextualTextShower = PPOptionAndPrecalc.toTextShower(optionAndPrecalc);
		const contextualMarkShower = PPOptionAndPrecalc.toMarkShower(optionAndPrecalc);
		return (value) => {
			const textShower = contextualTextShower(value);
			const markShower = contextualMarkShower(value);
			return (stringifiedValue) =>
				pipe(
					value,
					Option.liftPredicate(PPValue.belongsToRecord),
					Option.map(
						flow(
							MMatch.make,
							MMatch.when(
								PPValue.isFunction,
								flow(PPValue.stringKey, textShower('propertyKeyWhenFunctionValue'))
							),
							MMatch.when(
								PPValue.hasSymbolicKey,
								flow(PPValue.stringKey, textShower('propertyKeyWhenSymbol'))
							),
							MMatch.orElse(flow(PPValue.stringKey, textShower('propertyKeyWhenOther'))),
							ASText.prepend(
								pipe('prototypeStartDelimiter', markShower, ASText.repeat(value.protoDepth))
							),
							ASText.append(
								pipe('prototypeEndDelimiter', markShower, ASText.repeat(value.protoDepth))
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
