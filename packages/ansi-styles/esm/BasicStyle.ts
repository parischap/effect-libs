/**
 * This module implements a type that represents an ANSI style as defined in the Select Graphic
 * Rendition subset. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-characteristicSequences.
 * The type defined in this module is not meant to be instanciated directly, it is an abstract
 * type.
 *
 * @since 0.0.1
 */
import * as ASStyleCharacteristic from './StyleCharacteristic.js';

/**
 * Type that represents a BasicStyle
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/**
	 * Sorted array of the StyleCharacteristic's defining this style. Did not use a SortedSet because
	 * we need some waranties as to the order of equivalent elements when merging
	 * StyleCharacteristic's
	 *
	 * @since 0.0.1
	 */
	readonly characteristics: ReadonlyArray<ASStyleCharacteristic.Type>;
}

/**
 * Builds a StringTransformer that appends the set SequenceString of all the Characteristic's of
 * `context` and the reset SequenceString of all the Characteristic's of `self` not present in
 * `context`.
 *
 * @since 0.0.1
 * @category Destructors
 */
/*export const toAddResetSequenceString =
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
		);*/
