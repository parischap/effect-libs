/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * A RecordExtremityMarks is an interface that lets you specify the start and end marks of a record.
 * It is used by the RecordMarks module (see RecordMarks.ts)
 *
 * This module export 4 RecordExtremityMarks instances. You can define your own if necessary.
 *
 * @since 0.0.1
 */

import { MString } from '@parischap/effect-lib';
import { Option } from 'effect';

/**
 * Interface that represents a RecordExtremityMarks
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/**
	 * Start mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 */
	readonly start: Option.Option<string>;
	/**
	 * End mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 */
	readonly end: Option.Option<string>;
}

/**
 * Default RecordExtremityMarks instance for treeified output.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultTreeified: Type = {
	start: Option.some(''),
	end: Option.none()
};

/**
 * Default RecordExtremityMarks instance for arrays output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultMultiLineArray: Type = {
	start: Option.some('['),
	end: Option.some(']')
};

/**
 * Default RecordExtremityMarks instance for arrays output on a single line.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultSingleLineArray: Type = defaultMultiLineArray;

/**
 * Default RecordExtremityMarks instance for object output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultMultiLineObject: Type = {
	start: Option.some('{'),
	end: Option.some('}')
};

/**
 * Default RecordExtremityMarks instance for objects output on a single line.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultSingleLineObject: Type = {
	start: Option.map(defaultMultiLineObject.start, MString.append(' ')),
	end: Option.map(defaultMultiLineObject.end, MString.prepend(' '))
};
