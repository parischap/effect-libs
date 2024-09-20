/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * A PropertyFormatter is a function which lets you specify how you want to print the properties of
 * a record. From the stringified representation of the value of a property which it receives, it
 * must return the stringified representation of the whole property (key and value). There are three
 * predefined instances of PropertyFormatter's:
 *
 * - `valueOnly`: shows only the value of a property (similar to the usual way an array is printed).
 *   Basically, this is the identity function.
 * - `keyAndValue`: shows the key and the value of a property (similar to the usual way an object is
 *   printed). A mark can be prepended or appended to the key to show if the property comes from the
 *   object itself or from one of its prototypes.
 * - `auto`: applies `ValueOnly` to arrays and `KeyAndValue` to any other record
 *
 * Most of the time, you will use the `Auto` instance. `ValueOnly` may be used if the values of an
 * object are self-explanatory and showing the keys would bring no useful information. KeyAndValue
 * could be used if you want to show non-enumerable properties of an array like the `length`
 * property or other properties you might have set. It can also be used when treeifying if there are
 * arrays in the object to treeify).
 *
 * You can define your own PropertyFormatter if the provided ones don't suit your needs. All you
 * have to do is provide a function that matches Type.
 *
 * @since 0.0.1
 */

import { MMatch } from '@parischap/effect-lib';
import { Array, flow, Function, Option, pipe, String, Struct } from 'effect';
import type * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import * as PropertyMarks from './PropertyMarks.js';
import type * as StringifiedValue from './StringifiedValue.js';
import type * as Value from './Value.js';

/**
 * Type that represents a PropertyFormatter. `value` is the Value (see Value.ts) representing a
 * property and `stringified` is the stringified representation of the value of that property (see
 * StringifiedValue.ts). Based on these two parameters, it must return a stringified representation
 * of the whole property.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	(value: Value.All): (stringified: StringifiedValue.Type) => StringifiedValue.Type;
}

/**
 * PropertyFormatter instance that prints only the value of a property
 *
 * @since 0.0.1
 * @category Instances
 */
export const valueOnly: Type = () => Function.identity;

/**
 * Function that returns a PropertyFormatter instance that prints the key and value of a property.
 * Uses the `propertyMarks` and `colorSet` passed as parameter
 *
 * @since 0.0.1
 * @category Instances
 */
export const keyAndValue =
	(propertyMarks: PropertyMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
	(stringified) =>
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
		);

/**
 * Same as `keyAndValue` but uses `PropertyMarks.defaultInstance`
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultKeyAndValue = keyAndValue(PropertyMarks.defaultInstance);

/**
 * PropertyFormatter instance that uses the `valueOnly` instance for arrays and the `keyAndValue`
 * instance for other records. In the second case, uses the `propertyMarks` and `colorSet` passed as
 * parameter
 *
 * @since 0.0.1
 * @category Utils
 */
export const auto =
	(propertyMarks: PropertyMarks.Type) =>
	(colorSet: ColorSet.Type): Type =>
	(value) =>
		pipe(
			value,
			MMatch.make,
			MMatch.when(Struct.get('belongsToArray'), valueOnly),
			MMatch.orElse(pipe(colorSet, keyAndValue(propertyMarks)))
		);

/**
 * Same as `auto` but uses `PropertyMarks.defaultInstance`
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultAuto = auto(PropertyMarks.defaultInstance);
