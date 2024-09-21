/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements the pretty-printer options.
 *
 * Several Options instances are provided by this module. But you can define your own ones if
 * needed. All you have to do is provide an object that matches Type.
 *
 * @since 0.0.1
 */

import { pipe } from 'effect';
import * as ByPasser from './ByPasser.js';
import * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import * as PropertyFilter from './PropertyFilter.js';
import * as PropertyFormatter from './PropertyFormatter.js';
import * as RecordFormatter from './RecordFormatter.js';
import * as ValueOrder from './ValueOrder.js';

/**
 * Interface that represents the pretty-printer options
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	/**
	 * Maximum number of nested records that will be printed. A value inferior or equal to 0 means
	 * that only primitive values are shown.
	 */
	readonly maxDepth: number;

	/** Text to show instead of an array when maxDepth is reached. */
	readonly arrayLabel: FormattedString.Type;

	/** Text to show instead of a function when maxDepth is reached. */
	readonly functionLabel: FormattedString.Type;

	/** Text to show instead of a non-null object when maxDepth is reached. */
	readonly objectLabel: FormattedString.Type;

	/**
	 * Indicates the level in the prototypal chain of a record down to which properties are shown.
	 * maxPrototypeDepth <= 0 means that only properties of the top record are shown.
	 * maxPrototypeDepth = 1 means that only properties of the top record and its direct prototype are
	 * shown...
	 */
	readonly maxPrototypeDepth: number;

	/**
	 * Text to show instead of a record that contains a direct or indirect circular reference to
	 * itself.
	 */
	readonly circularLabel: FormattedString.Type;

	/**
	 * `ValueOrder` instance: allows you to specify how to sort properties when printing records (see
	 * ValueOrder.ts)
	 */
	readonly propertySortOrder: ValueOrder.Type;

	/**
	 * A key with the same name can appear in an object and one or several of its prototypes. This
	 * option allows you to decide if you want to keep all the properties with the same name. If true,
	 * only the first occurrence of each property with the same name is kept (sorting happens before
	 * deduping, so you can decide which property will be first by choosing your propertySortOrder
	 * carefully). If false, all occurrences of the same property are kept. Deduping is only performed
	 * on records that are not arrays
	 */
	readonly dedupeRecordProperties: boolean;

	/**
	 * `ByPasser` instance: allows you to specify which values receive a special stringification
	 * process (see ByPasser.ts)
	 */
	readonly byPasser: ByPasser.Type;

	/**
	 * `PropertyFilter` instance: allows you to specify which properties are shown when printing
	 * records (see PropertyFilter.ts)
	 */
	readonly propertyFilter: PropertyFilter.Type;

	/**
	 * `PropertyFormatter` instance: allows you to specify how to format record properties (see
	 * PropertyFormatter.ts)
	 */
	readonly propertyFormatter: PropertyFormatter.Type;

	/**
	 * `RecordFormatter` instance: allows you to specify how to print a record from its stringified
	 * properties (see RecordFormatter.ts)
	 */
	readonly recordFormatter: RecordFormatter.Type;
}

/**
 * Function that returns an `Options` instance that pretty-prints a value on a single line in a way
 * very similar to util.inspect
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine = (colorSet: ColorSet.Type): Type => ({
	maxDepth: 10,
	arrayLabel: pipe('[Array]', FormattedString.makeWith(colorSet.otherValueColorer)),
	functionLabel: pipe('(Function)', FormattedString.makeWith(colorSet.otherValueColorer)),
	objectLabel: pipe('{Object}', FormattedString.makeWith(colorSet.otherValueColorer)),
	maxPrototypeDepth: 0,
	circularLabel: pipe('(Circular)', FormattedString.makeWith(colorSet.otherValueColorer)),
	propertySortOrder: ValueOrder.byStringKey,
	dedupeRecordProperties: false,
	byPasser: ByPasser.objectAsValue(colorSet),
	propertyFilter: PropertyFilter.removeNonEnumerables,
	propertyFormatter: PropertyFormatter.defaultAuto(colorSet),
	recordFormatter: RecordFormatter.defaultSingleLine(colorSet)
});

/**
 * `Options` instance that pretty-prints a value on a single line in a way very similar to
 * util.inspect - No colors added
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredSingleLine = singleLine(ColorSet.uncolored);

/**
 * `Options` instance that pretty-prints a value on a single line in a way very similar to
 * util.inspect - With colors adapted to the the darkmode
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkSingleLine = singleLine(ColorSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value on multiple lines with
 * indentation in a way very similar to util.inspect
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabified = (colorSet: ColorSet.Type): Type => ({
	...singleLine(colorSet),
	recordFormatter: RecordFormatter.defaultTabified(colorSet)
});

/**
 * `Options` instance that pretty-prints a value on multiple lines with indentation in a way very
 * similar to util.inspect - No colors added
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredTabified = tabified(ColorSet.uncolored);

/**
 * `Options` instance that pretty-prints a value on multiple lines with indentation in a way very
 * similar to util.inspect - With colors adapted to the the darkmode
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTabified = tabified(ColorSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value on multiple lines with a
 * tree-like structure in a way very similar to util.inspect
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeified = (colorSet: ColorSet.Type): Type => ({
	...singleLine(colorSet),
	byPasser: ByPasser.objectAsValueWithoutNullables(colorSet),
	propertyFormatter: PropertyFormatter.defaultKeyAndValue(colorSet),
	recordFormatter: RecordFormatter.defaultTreeified(colorSet)
});

/**
 * `Options` instance that pretty-prints a value on multiple lines with a tree-like structure in a
 * way very similar to util.inspect - No colors added
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredTreeified = treeified(ColorSet.uncolored);

/**
 * `Options` instance that pretty-prints a value on multiple lines with a tree-like structure in a
 * way very similar to util.inspect - With colors adapted to the the darkmode
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTreeified = treeified(ColorSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value in a way very similar to
 * util.inspect. Records are printed on a multiple lines when the total length of their stringified
 * properties strictly exceeds 40 characters
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabifiedSplitWhenTotalLengthExceeds40 = (colorSet: ColorSet.Type): Type => ({
	...singleLine(colorSet),
	recordFormatter: RecordFormatter.defaultAutoBasedOnTotalLength(40)(colorSet)
});

/**
 * `Options` instance that pretty-prints a value on multiple lines with indentation in a way very
 * similar to util.inspect - No colors added
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredTabifiedSplitWhenTotalLengthExceeds40 = tabifiedSplitWhenTotalLengthExceeds40(
	ColorSet.uncolored
);

/**
 * `Options` instance that pretty-prints a value on multiple lines with indentation in a way very
 * similar to util.inspect - With colors adapted to the the darkmode
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTabifiedSplitWhenTotalLengthExceeds40 = tabifiedSplitWhenTotalLengthExceeds40(
	ColorSet.ansiDarkMode
);
