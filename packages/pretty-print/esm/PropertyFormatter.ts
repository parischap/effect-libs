/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that takes care if the stringification of the properties of a
 * record. From the stringified representation of the value of a property which it receives, it must
 * return the stringified representation of the whole property (key and value).
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
	Function,
	Hash,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import type * as PPFormatSet from './FormatMap.js';
import * as PPFormattedString from './FormattedString.js';
import * as PPPropertyMarks from './PropertyMarks.js';
import type * as PPStringifiedValue from './StringifiedValue.js';
import * as PPValue from './Value.js';

const moduleTag = '@parischap/pretty-print/PropertyFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of the action of this PropertyFormatter. `value` is the Value (see Value.ts) representing a
 * property and `stringified` is the stringified representation of the value of that property (see
 * StringifiedValue.ts). Based on these two parameters, it must return a stringified representation
 * of the whole property.
 */
interface ActionType {
	(value: PPValue.All): MTypes.OneArgFunction<PPStringifiedValue.Type>;
}
/**
 * Type that represents a PropertyFormatter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this PropertyFormatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

	/**
	 * Action of this PropertyFormatter. `value` is the Value (see Value.ts) representing a property
	 * and `stringified` is the stringified representation of the value of that property (see
	 * StringifiedValue.ts). Based on these two parameters, it must return a stringified
	 * representation of the whole property.
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
 * PropertyFormatter equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.id));
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
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @since 0.0.1
 * @category Instances
 */
export const valueOnly: Type = make({ id: 'ValueOnly', action: () => Function.identity });

/**
 * Function that returns a PropertyFormatter instance that prints the key and value of a property
 * (similar to the usual way an object is printed). A mark can be prepended or appended to the key
 * to show if the property comes from the object itself or from one of its prototypes. Uses the
 * `propertyMarks` and `formatSet` passed as parameter
 *
 * @since 0.0.1
 * @category Instances
 */
export const keyAndValue =
	(propertyMarks: PPPropertyMarks.Type) =>
	(formatSet: PPFormatSet.Type): Type =>
		make({
			id: formatSet.id + 'KeyAndValueWith' + propertyMarks.id,
			action: (value) => (stringified) =>
				pipe(
					value.stringKey,
					Option.liftPredicate(String.isNonEmpty),
					Option.match({
						onNone: () => stringified,
						onSome: flow(
							PPFormattedString.makeWith(
								PPValue.isRecordWithFunctionValue(value) ?
									formatSet.propertyKeyFormatterWhenFunctionValue
								: value.hasSymbolicKey ? formatSet.propertyKeyFormatterWhenSymbol
								: formatSet.propertyKeyFormatterWhenOther
							),
							PPFormattedString.prepend(
								pipe(
									propertyMarks.prototypePrefix,
									PPFormattedString.makeWith(formatSet.prototypeMarkFormatter),
									PPFormattedString.repeat(value.protoDepth)
								)
							),
							PPFormattedString.append(
								pipe(
									propertyMarks.prototypeSuffix,
									PPFormattedString.makeWith(formatSet.prototypeMarkFormatter),
									PPFormattedString.repeat(value.protoDepth)
								)
							),
							(key) =>
								Array.match(stringified, {
									onEmpty: () => Array.of(key),
									onNonEmpty: flow(
										Array.modifyNonEmptyHead(
											flow(
												Option.liftPredicate(PPFormattedString.isNonEmpty),
												Option.match({
													onNone: () => key,
													onSome: flow(
														PPFormattedString.prepend(
															pipe(
																propertyMarks.keyValueSeparator,
																PPFormattedString.makeWith(formatSet.keyValueSeparatorFormatter)
															)
														),
														PPFormattedString.prepend(key)
													)
												})
											)
										)
									)
								})
						)
					})
				)
		});

/**
 * Alias for `keyAndValue(PPPropertyMarks.objectMarks)`
 *
 * @since 0.0.1
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
 * @since 0.0.1
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
 * @since 0.0.1
 * @category Instances
 */
export const recordLike: (formatSet: PPFormatSet.Type) => Type = valueForArraysKeyAndValueForOthers(
	PPPropertyMarks.object
);
