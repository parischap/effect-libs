/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
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
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import * as PropertyMarks from './PropertyMarks.js';
import type * as StringifiedValue from './StringifiedValue.js';
import type * as Value from './Value.js';

const moduleTag = '@parischap/pretty-print/PropertyFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a PropertyFormatter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this PropertyFormatter instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Action of this PropertyFormatter. `value` is the Value (see Value.ts) representing a property
	 * and `stringified` is the stringified representation of the value of that property (see
	 * StringifiedValue.ts). Based on these two parameters, it must return a stringified
	 * representation of the whole property.
	 *
	 * @since 0.0.1
	 */
	readonly action: (
		value: Value.All
	) => (stringified: StringifiedValue.Type) => StringifiedValue.Type;
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

/** Equivalence */
const _equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

export {
	/**
	 * PropertyFormatter equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	_equivalence as Equivalence
};

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type) {
		return this.name === '' ? this : this.name;
	},
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor without a name
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'name'>): Type =>
	_make({ ...params, name: '' });

/**
 * Returns a copy of `self` with `name` set to `name`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setName =
	(name: string) =>
	(self: Type): Type =>
		_make({ ...self, name: name });

/**
 * PropertyFormatter instance that prints only the value of a property (similar to the usual way an
 * array is printed).
 *
 * @since 0.0.1
 * @category Instances
 */
export const valueOnly: Type = _make({ name: 'valueOnly', action: () => Function.identity });

/**
 * Function that returns a PropertyFormatter instance that prints the key and value of a property
 * (similar to the usual way an object is printed). A mark can be prepended or appended to the key
 * to show if the property comes from the object itself or from one of its prototypes. Uses the
 * `propertyMarks` and `colorSet` passed as parameter
 *
 * @since 0.0.1
 * @category Instances
 */
export const keyAndValue =
	(propertyMarks: PropertyMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name: colorSet.name + 'KeyAndValueWith' + String.capitalize(propertyMarks.name),
			action: (value) => (stringified) =>
				pipe(
					value.stringKey,
					Option.liftPredicate(String.isNonEmpty),
					Option.match({
						onNone: () => stringified,
						onSome: flow(
							FormattedString.makeWith(
								value.hasFunctionValue ? colorSet.propertyKeyColorerWhenFunctionValue
								: value.hasSymbolicKey ? colorSet.propertyKeyColorerWhenSymbol
								: colorSet.propertyKeyColorerWhenOther
							),
							FormattedString.prepend(
								pipe(
									propertyMarks.prototypePrefix,
									FormattedString.makeWith(colorSet.prototypeMarkColorer),
									FormattedString.repeat(value.protoDepth)
								)
							),
							FormattedString.append(
								pipe(
									propertyMarks.prototypeSuffix,
									FormattedString.makeWith(colorSet.prototypeMarkColorer),
									FormattedString.repeat(value.protoDepth)
								)
							),
							(key) =>
								Array.match(stringified, {
									onEmpty: () => Array.of(key),
									onNonEmpty: flow(
										Array.modifyNonEmptyHead(
											flow(
												Option.liftPredicate(FormattedString.isNonEmpty),
												Option.match({
													onNone: () => key,
													onSome: flow(
														FormattedString.prepend(
															pipe(
																propertyMarks.keyValueSeparator,
																FormattedString.makeWith(colorSet.keyValueSeparatorColorer)
															)
														),
														FormattedString.prepend(key)
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
 * Alias for `keyAndValue(PropertyMarks.objectMarks)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const keyAndValueWithObjectMarks: (colorSet: ColorSet.Type) => Type = keyAndValue(
	PropertyMarks.object
);

/**
 * PropertyFormatter instance that uses the `valueOnly` instance for arrays and the `keyAndValue`
 * instance for other records. In the second case, uses the `propertyMarks` and `colorSet` passed as
 * parameter
 *
 * @since 0.0.1
 * @category Utils
 */
export const valueForArraysKeyAndValueForOthers =
	(propertyMarks: PropertyMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
		_make({
			name:
				colorSet.name +
				'ValueForArraysKeyAndValueWith' +
				String.capitalize(propertyMarks.name) +
				'ForOthers',
			action: (value) =>
				pipe(
					value,
					MMatch.make,
					MMatch.when(Struct.get('belongsToArray'), valueOnly.action),
					MMatch.orElse(keyAndValue(propertyMarks)(colorSet).action)
				)
		});

/**
 * Alias for `valueForArraysKeyAndValueForOthers(PropertyMarks.objectMarks)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const recordLike: (colorSet: ColorSet.Type) => Type = valueForArraysKeyAndValueForOthers(
	PropertyMarks.object
);
