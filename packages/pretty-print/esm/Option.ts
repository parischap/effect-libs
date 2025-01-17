/**
 * This module implements the options for pretty-printing.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { pipe } from 'effect';
import * as PPByPasser from './ByPasser.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPPropertyFilter from './PropertyFilter.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPRecordFormatter from './RecordFormatter.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValueOrder from './ValueOrder.js';

import { MInspectable, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';

export const moduleTag = '@parischap/pretty-print/Option/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents the options for pretty printing
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this Option instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

	/**
	 * Map of ContextFormatter's are used to style the different parts of a stringified value
	 *
	 * @since 0.3.0
	 */
	readonly styleMap: PPStyleMap.Type;

	/**
	 * Map of the different marks that appear in a value to stringify
	 *
	 * @since 0.3.0
	 */
	readonly markMap: PPMarkMap.Type;

	/**
	 * Maximum number of nested records that will be opened. A value inferior or equal to 0 means that
	 * only primitive values of the value to stringify are shown. The others are replaced by
	 * `arrayLabel`, `functionLabel` or `objectLabel`.
	 *
	 * @since 0.0.1
	 */
	readonly maxDepth: number;

	/**
	 * Indicates the level in the prototypal chain of a record down to which properties are shown.
	 * maxPrototypeDepth <= 0 means that only properties of the top record are shown.
	 * maxPrototypeDepth = 1 means that only properties of the top record and its direct prototype are
	 * shown...
	 *
	 * @since 0.0.1
	 */
	readonly maxPrototypeDepth: number;

	/**
	 * `ValueOrder` instance: allows you to specify how to sort properties when printing records (see
	 * ValueOrder.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertySortOrder: PPValueOrder.Type;

	/**
	 * A key with the same id can appear in an object and one or several of its prototypes. This
	 * option allows you to decide if you want to keep all these properties with the same id. If true,
	 * only the first occurrence of each property with the same id is kept. Sorting happens before
	 * deduping, so you can decide which property will be first by choosing your propertySortOrder
	 * carefully. Usually, you will use `propertySortOrder: ValueOrder.byPrototypalDepth`. If false,
	 * all occurrences of the same property are kept. Deduping is only performed on records that are
	 * not arrays
	 *
	 * @since 0.0.1
	 */
	readonly dedupeRecordProperties: boolean;

	/**
	 * `ByPasser` instance: allows you to specify which values receive a special stringification
	 * process (see ByPasser.ts)
	 *
	 * @since 0.0.1
	 */
	readonly byPasser: PPByPasser.Type;

	/**
	 * `PropertyFilter` instance: allows you to specify which properties are shown when printing
	 * records (see PropertyFilter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertyFilter: PPPropertyFilter.Type;

	/**
	 * `PropertyFormatter` instance: allows you to specify how to format record properties (see
	 * PropertyFormatter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertyFormatter: PPPropertyFormatter.Type;

	/**
	 * `RecordFormatter` instance: allows you to specify how to print a record from its stringified
	 * properties (see RecordFormatter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly recordFormatter: PPRecordFormatter.Type;

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
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
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
 * Constructor without a id
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Function that returns an `Option` instance that pretty-prints a value on a single line in a way
 * very similar to util.inspect. It takes a `FormatSet` instance as an argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'SingleLine',
		maxDepth: 10,
		arrayLabel: pipe('[Array]', PPString.makeWith(formatSet.otherValueFormatter)),
		functionLabel: pipe('(Function)', PPString.makeWith(formatSet.otherValueFormatter)),
		objectLabel: pipe('{Object}', PPString.makeWith(formatSet.otherValueFormatter)),
		maxPrototypeDepth: 0,
		circularLabel: pipe('(Circular)', PPString.makeWith(formatSet.otherValueFormatter)),
		propertySortOrder: PPValueOrder.byStringKey,
		dedupeRecordProperties: false,
		byPasser: PPByPasser.objectAsValue(formatSet),
		propertyFilter: PPPropertyFilter.removeNonEnumerables,
		propertyFormatter: PPPropertyFormatter.recordLike(formatSet),
		recordFormatter: PPRecordFormatter.singleLine(formatSet)
	});

/**
 * Alias for `singleLine(PPFormatSet.none)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const unformattedSingleLine: Type = singleLine(PPFormatSet.none);

/**
 * Alias for `singleLine(PPFormatSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkSingleLine: Type = singleLine(PPFormatSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value on multiple indented lines
 * in a way very similar to util.inspect. It takes a `FormatSet` instance as an argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabified = (formatSet: PPFormatSet.Type): Type =>
	pipe(
		singleLine(formatSet),
		MStruct.set({
			id: formatSet.id + 'Tabified',
			recordFormatter: PPRecordFormatter.tabified(formatSet)
		}),
		make
	);

/**
 * Alias for `tabified(PPFormatSet.none)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const unformattedTabified: Type = tabified(PPFormatSet.none);

/**
 * Alias for `tabified(PPFormatSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTabified: Type = tabified(PPFormatSet.ansiDarkMode);

/**
 * Function that returns an `Option` instance that pretty-prints a value on multiple lines with a
 * tree-like structure in a way very similar to util.inspect. It takes a `PPFormatSet` instance as
 * an argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeified = (formatSet: PPFormatSet.Type): Type =>
	pipe(
		singleLine(formatSet),
		MStruct.set({
			id: formatSet.id + 'Treeified',
			byPasser: PPByPasser.objectAsValueWithoutNullables(formatSet),
			propertyFormatter: PPPropertyFormatter.keyAndValueWithObjectMarks(formatSet),
			recordFormatter: PPRecordFormatter.tabified(formatSet)
		}),
		make
	);

/**
 * Alias for `treeified(PPFormatSet.none)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const unformattedTreeified: Type = treeified(PPFormatSet.none);

/**
 * Alias for `treeified(PPFormatSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTreeified: Type = treeified(PPFormatSet.ansiDarkMode);

/**
 * Same as `singleLine` but, if the value to pretty-print is a record, it, and any sub-record it
 * contains, will be printed on multiple indented lines if the total length of its stringified
 * properties is less than or equal to 40 characters. Record-marks are not included in the count.
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitWhenTotalLengthExceeds40 = (formatSet: PPFormatSet.Type): Type =>
	pipe(
		singleLine(formatSet),
		MStruct.set({
			id: formatSet.id + 'SplitWhenTotalLengthExceeds40',
			recordFormatter: pipe(formatSet, PPRecordFormatter.splitOnTotalLength(40))
		}),
		make
	);

/**
 * Alias for `splitWhenTotalLengthExceeds40(PPFormatSet.none)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const unformattedSplitWhenTotalLengthExceeds40: Type = splitWhenTotalLengthExceeds40(
	PPFormatSet.none
);

/**
 * Alias for `splitWhenTotalLengthExceeds40(PPFormatSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkSplitWhenTotalLengthExceeds40: Type = splitWhenTotalLengthExceeds40(
	PPFormatSet.ansiDarkMode
);
