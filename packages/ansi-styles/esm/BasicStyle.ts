/**
 * This module implements a type that represents an ANSI style as defined in the Select Graphic
 * Rendition subset. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-characteristicSequences.
 * The type defined in this module is not meant to be instanciated directly, it is an abstract
 * type.
 *
 * @since 0.0.1
 */
import { MInspectable, MString, MTypes } from '@parischap/effect-lib';
import { Array, Equal, flow, pipe, Pipeable, Struct } from 'effect';
import * as ASCharacteristic from './Characteristic.js';
import * as ASSequence from './Sequence.js';
import * as ASSequenceString from './SequenceString.js';

/**
 * Type that represents a BasicStyle
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this style
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
	// Did not use a SortedSet because I need some waranties as to the order of equal elements when merging Characteristic's
	/**
	 * Sorted array of the Characteristic's defining this style
	 *
	 * @since 0.0.1
	 */
	readonly characteristics: ReadonlyArray<ASCharacteristic.Type>;

	/**
	 * StringTransformer that prepends the set SequenceString corresponding to this style
	 *
	 * @since 0.0.1
	 */
	readonly addSetSequenceString: MTypes.StringTransformer;
}

/**
 * Gets the `id` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Gets the `characteristics` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const characteristics: MTypes.OneArgFunction<
	Type,
	ReadonlyArray<ASCharacteristic.Type>
> = Struct.get('characteristics');

/**
 * Gets the `addSetSequenceString` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const addSetSequenceString: MTypes.OneArgFunction<Type, MTypes.StringTransformer> =
	Struct.get('addSetSequenceString');

/**
 * Builds a BasicStyle from the combination of two other BasicStyles. If `self` and `that` contain
 * contrary Characteristic's (e.g `self` contains `Bold` and `that` contains `Dim`), the
 * characteristics in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const combine = (that: Type) => (self: Type) => {
	const characteristics = pipe(
		that.characteristics,
		ASCharacteristic.mergeByIndexAndId(self.characteristics),
		Array.dedupeAdjacent
	) as unknown as Array.NonEmptyReadonlyArray<ASCharacteristic.Type>;

	return {
		id: pipe(characteristics, Array.map(ASCharacteristic.id), Array.join('')),
		characteristics,
		addSetSequenceString: pipe(
			characteristics,
			Array.map(ASCharacteristic.sequence),
			Array.flatten,
			ASSequenceString.fromNonEmptySequence,
			MString.prepend
		)
	};
};

/**
 * Builds a StringTransformer that appends the set SequenceString of all the Characteristic's of
 * `context` and the reset SequenceString of all the Characteristic's of `self` not present in
 * `context`.
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toAddResetSequenceString =
	(context: Type) =>
	(self: Type): MTypes.StringTransformer =>
		pipe(
			self.characteristics,
			ASCharacteristic.differenceByIndex(context.characteristics),
			Array.map(flow(ASCharacteristic.index, ASSequence.resetFromCharacteristicIndex)),
			Array.appendAll(pipe(self.characteristics, Array.map(ASCharacteristic.sequence))),
			Array.flatten,
			ASSequenceString.fromSequence,
			MString.append
		);
