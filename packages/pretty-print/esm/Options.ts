/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements the pretty-printer options.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
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

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Inspectable, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/Options/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents the pretty-printer options
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this Options instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Maximum number of nested records that will be printed. A value inferior or equal to 0 means
	 * that only primitive values are shown.
	 *
	 * @since 0.0.1
	 */
	readonly maxDepth: number;

	/**
	 * Text to show instead of an array when maxDepth is reached.
	 *
	 * @since 0.0.1
	 */
	readonly arrayLabel: FormattedString.Type;

	/**
	 * Text to show instead of a function when maxDepth is reached.
	 *
	 * @since 0.0.1
	 */
	readonly functionLabel: FormattedString.Type;

	/**
	 * Text to show instead of a non-null object when maxDepth is reached.
	 *
	 * @since 0.0.1
	 */
	readonly objectLabel: FormattedString.Type;

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
	 * Text to show instead of a record that contains a direct or indirect circular reference to
	 * itself.
	 *
	 * @since 0.0.1
	 */
	readonly circularLabel: FormattedString.Type;

	/**
	 * `ValueOrder` instance: allows you to specify how to sort properties when printing records (see
	 * ValueOrder.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertySortOrder: ValueOrder.Type;

	/**
	 * A key with the same name can appear in an object and one or several of its prototypes. This
	 * option allows you to decide if you want to keep all these properties with the same name. If
	 * true, only the first occurrence of each property with the same name is kept. Sorting happens
	 * before deduping, so you can decide which property will be first by choosing your
	 * propertySortOrder carefully. Usually, you will use `propertySortOrder:
	 * ValueOrder.byPrototypalDepth`. If false, all occurrences of the same property are kept.
	 * Deduping is only performed on records that are not arrays
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
	readonly byPasser: ByPasser.Type;

	/**
	 * `PropertyFilter` instance: allows you to specify which properties are shown when printing
	 * records (see PropertyFilter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertyFilter: PropertyFilter.Type;

	/**
	 * `PropertyFormatter` instance: allows you to specify how to format record properties (see
	 * PropertyFormatter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly propertyFormatter: PropertyFormatter.Type;

	/**
	 * `RecordFormatter` instance: allows you to specify how to print a record from its stringified
	 * properties (see RecordFormatter.ts)
	 *
	 * @since 0.0.1
	 */
	readonly recordFormatter: RecordFormatter.Type;

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
	 * Equivalence
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
 * Function that returns an `Options` instance that pretty-prints a value on a single line in a way
 * very similar to util.inspect. It takes a `ColorSet` instance as an argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + 'SingleLine',
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
		propertyFormatter: PropertyFormatter.recordLike(colorSet),
		recordFormatter: RecordFormatter.singleLine(colorSet)
	});

/**
 * Alias for `singleLine(ColorSet.uncolored)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredSingleLine: Type = singleLine(ColorSet.uncolored);

/**
 * Alias for `singleLine(ColorSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkSingleLine: Type = singleLine(ColorSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value on multiple indented lines
 * in a way very similar to util.inspect. It takes a `ColorSet` instance as an argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tabified = (colorSet: ColorSet.Type): Type =>
	_make({
		...singleLine(colorSet),
		name: colorSet.name + 'Tabified',
		recordFormatter: RecordFormatter.tabified(colorSet)
	});

/**
 * Alias for `tabified(ColorSet.uncolored)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredTabified: Type = tabified(ColorSet.uncolored);

/**
 * Alias for `tabified(ColorSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTabified: Type = tabified(ColorSet.ansiDarkMode);

/**
 * Function that returns an `Options` instance that pretty-prints a value on multiple lines with a
 * tree-like structure in a way very similar to util.inspect. It takes a `ColorSet` instance as an
 * argument.
 *
 * @since 0.0.1
 * @category Instances
 */
export const treeified = (colorSet: ColorSet.Type): Type =>
	_make({
		...singleLine(colorSet),
		name: colorSet.name + 'Treeified',
		byPasser: ByPasser.objectAsValueWithoutNullables(colorSet),
		propertyFormatter: PropertyFormatter.keyAndValueWithObjectMarks(colorSet),
		recordFormatter: RecordFormatter.treeified(colorSet)
	});

/**
 * Alias for `treeified(ColorSet.uncolored)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredTreeified: Type = treeified(ColorSet.uncolored);

/**
 * Alias for `treeified(ColorSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkTreeified: Type = treeified(ColorSet.ansiDarkMode);

/**
 * Same as `singleLine` but, if the value to pretty-print is a record, it, and any sub-record it
 * contains, will be printed on multiple indented lines if the total length of its stringified
 * properties is less than or equal to 40 characters. Record-marks are not included in the count.
 *
 * @since 0.0.1
 * @category Instances
 */
export const splitWhenTotalLengthExceeds40 = (colorSet: ColorSet.Type): Type =>
	_make({
		...singleLine(colorSet),
		name: colorSet.name + 'SplitWhenTotalLengthExceeds40',
		recordFormatter: RecordFormatter.splitOnTotalLength(40)(colorSet)
	});

/**
 * Alias for `splitWhenTotalLengthExceeds40(ColorSet.uncolored)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const uncoloredSplitWhenTotalLengthExceeds40: Type = splitWhenTotalLengthExceeds40(
	ColorSet.uncolored
);

/**
 * Alias for `splitWhenTotalLengthExceeds40(ColorSet.ansiDarkMode)`
 *
 * @since 0.0.1
 * @category Instances
 */
export const ansiDarkSplitWhenTotalLengthExceeds40: Type = splitWhenTotalLengthExceeds40(
	ColorSet.ansiDarkMode
);
