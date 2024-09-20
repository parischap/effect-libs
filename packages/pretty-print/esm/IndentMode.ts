/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * An IndentMode is an interface that lets you specify the fillers used when printing a record on
 * multiple lines. It is used by the RecordFormatter module (see RecordFormatter.ts)
 *
 * This module export two IndentMode instances. You can define your own if necessary.
 *
 * @since 0.0.1
 */

/**
 * Interface that defines an IndentMode
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/**
	 * Filler prepended to the first line of the stringified representation of each property, except
	 * the last, of a record
	 */
	readonly initPropFirstLine: string;
	/**
	 * Filler prepended to the first line of the stringified representation of the last property of a
	 * record
	 */
	readonly lastPropFirstLine: string;
	/**
	 * Filler prepended to the all lines but the first of the stringified representation of each
	 * property, except the last, of a record
	 */
	readonly initPropTailLines: string;
	/**
	 * Filler prepended to the all lines but the first of the stringified representation of the last
	 * property of a record
	 */
	readonly lastPropTailLines: string;
}

/**
 * IndentMode instance for tabified output. Uses 2 spaces as tabs.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabify: Type = {
	initPropFirstLine: '  ',
	lastPropFirstLine: '  ',
	initPropTailLines: '  ',
	lastPropTailLines: '  '
};

/**
 * IndentMode instance for treeified output. Uses horizontal and vertical lines as tabs.
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeify: Type = {
	initPropFirstLine: '├─ ',
	lastPropFirstLine: '└─ ',
	initPropTailLines: '│  ',
	lastPropTailLines: '   '
};
