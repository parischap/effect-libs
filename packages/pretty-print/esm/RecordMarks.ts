/**
 * A RecordMarks is an interface that lets you specify the marks to print when printing a record. It
 * is used by the RecordFormatter module (see RecordFormatter.ts)
 *
 * This module export three RecordMarks instances. You can define your own if necessary.
 *
 * @since 0.0.1
 */

import * as RecordExtremityMarks from './RecordExtremityMarks.js';

/**
 * Interface that represents a RecordMarks
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/** Separator inserted between the properties of a record */
	readonly propertySeparator: string;
	/** Marks inserted at the start/end of an array. */
	readonly arrayMarks: RecordExtremityMarks.Type;
	/** Marks inserted at the start/end of an object. */
	readonly objectMarks: RecordExtremityMarks.Type;
}

/**
 * Default RecordMarks instance for treeifying.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultTreeified: Type = {
	propertySeparator: '',
	arrayMarks: RecordExtremityMarks.defaultTreeified,
	objectMarks: RecordExtremityMarks.defaultTreeified
};

/**
 * Default RecordMarks instance for array and object output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultMultiLine: Type = {
	propertySeparator: ',',
	arrayMarks: RecordExtremityMarks.defaultMultiLineArray,
	objectMarks: RecordExtremityMarks.defaultMultiLineObject
};

/**
 * Default RecordMarks instance for array and object output on single lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultSingleLine: Type = {
	propertySeparator: defaultMultiLine.propertySeparator + ' ',
	arrayMarks: RecordExtremityMarks.defaultSingleLineArray,
	objectMarks: RecordExtremityMarks.defaultSingleLineObject
};
