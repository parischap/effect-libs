/**
 * This module implements the options for pretty-printing.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import { MCache, MFunction, MMatch, MString, MStruct, MTree, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Either,
	flow,
	Function,
	HashMap,
	HashSet,
	MutableHashMap,
	Number,
	Option,
	pipe,
	SortedMap,
	SortedSet,
	Struct,
	Tuple
} from 'effect';

import { MInspectable, MPipeable } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';
import * as PPByPasser from './ByPasser.js';
import * as PPByPassers from './ByPassers.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPMarkShower from './MarkShower.js';
import * as PPMarkShowerConstructor from './MarkShowerConstructor.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPPrimitiveFormatter from './PrimitiveFormatter.js';
import * as PPPropertyFilter from './PropertyFilter.js';
import * as PPPropertyFilters from './PropertyFilters.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';
import * as PPValueBasedStylerConstructor from './ValueBasedStylerConstructor.js';
import * as PPValueOrder from './ValueOrder.js';
import * as PPValues from './Values.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/pretty-print/Option/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Stringifier
 *
 * @category Models
 */
export namespace Stringifier {
	/**
	 * Type of a Stringifier
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> {}
}

/**
 * Possible sources of properties for non-primitive values
 *
 * @category Models
 */

export enum PropertySource {
	/**
	 * Properties are obtained by calling Reflect.getOwnProperties on the non-primitive-value and its
	 * prototypes (until maxPrototypeDepth is reached). This is usually a good choice for records
	 */
	FromProperties = 0,

	/**
	 * Properties are obtained by iterating over the non-primitive-value that must implement the
	 * Iterable protocol. Each value returned by the iterator is used to create a property with an
	 * auto-incremented numerical key (converted to a string). This is usually a good choice for
	 * arrays and sets.
	 */
	FromValueIterable = 1,

	/**
	 * Properties are obtained by iterating over the non-primitive-value that must implement the
	 * Iterable protocol. The iterator must return a key/value pair. Otherwise, the returned value is
	 * ignored. This is usually a good choice for maps,...
	 */
	FromKeyValueIterable = 2
}

/**
 * Possible options regarding the display of the number of properties of a non-primitive value.
 *
 * @category Models
 */

export enum PropertyNumberDisplayOption {
	/** The number of properties is not shown */
	None = 0,
	/** Shows the number of properties retrieved from the property source */
	All = 1,
	/**
	 * Shows the number of properties actually displayed, i.e. these remaining after filtering,
	 * deduping and applying `maxPropertyNumber`
	 */
	Actual = 2,
	/**
	 * Shows both the number of properties retrieved from the property source and the number of
	 * properties actually displayed (after filtering, deduping and applying `maxPropertyNumber`)
	 */
	AllAndActual = 3,
	/**
	 * Shows both the number of properties retrieved from the property source and the number of
	 * properties actually displayed (after filtering, deduping and applying `maxPropertyNumber`) only
	 * if these two numbers are different. Otherwise, does not show anything
	 */
	AllAndActualIfDifferent = 4
}

/**
 * Namespace for the options for pretty printing non-primitive values
 *
 * @category Models
 */

export namespace NonPrimitive {
	const namespaceTag = moduleTag + 'NonPrimitive/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;
	/**
	 * Type of an option for a NonPrimitive
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
		/**
		 * Id of this type of non-primitive valie. This id is:
		 *
		 * - Used for equality and debugging
		 * - Displayed in case `maxDepth` is superseded surrounded by the MessageStartDelimiter and
		 *   MessageEndDelimiter marks. For instance: [Array]
		 * - Displayed in front of the representation of the non-primitive value even if `maxDepth` is not
		 *   superseded if `showId` is `true` (see below).
		 */
		readonly id: string;

		/**
		 * If true, the id will be shown just before the non-primitive value representation seperated
		 * from it by the `NonPrimitiveValueNameSeparator` mark. For instance: `Map { 'a' => 1, 'b' => 2
		 * }`
		 */
		readonly showId: boolean;

		/**
		 * Options regarding the display of the property number of a non-primitive value. If not `None`,
		 * the property number will be suffixed to the id in between the `PropertyNumberStartDelimiter`
		 * and `PropertyNumberEndDelimiter` marks. For `AllAndActual` and `AllAndActualIfDifferent`, the
		 * `PropertyNumberSeparator` mark is used to seperate the two property numbers. For instance:
		 * `Map(2) { 'a' => 1, 'b' => 2 }` with `Actual` or `Map(5,2) { 'a' => 1, 'b' => 2 }` with
		 * `AllAndActual`
		 */
		readonly propertyNumberDisplayOption: PropertyNumberDisplayOption;

		/** Key/value separator mark for that type of non-primitive value. For instance ': ' for an array */
		readonly keyValueSeparatorMark: string;

		/**
		 * Mark shown before the representation of a non-primitive value when it is displayed on a
		 * single line. For instance '{ ' for a record
		 */
		readonly singleLineStartDelimiterMark: string;

		/**
		 * Mark shown after the representation of a non-primitive value when it is displayed on a single
		 * line. For instance ' }' for a record
		 */
		readonly singleLineEndDelimiterMark: string;

		/**
		 * Mark shown before the representation of a non-primitive value when it is displayed on
		 * multiple lines. For instance '{' for a record
		 */
		readonly multiLineStartDelimiterMark: string;

		/**
		 * Mark shown after the representation of a non-primitive value when it is displayed on multiple
		 * lines. For instance '}' for a record
		 */
		readonly multiLineEndDelimiterMark: string;

		/**
		 * Mark repeated before the key of the property of a non-primitive value to indicate the depth
		 * of that key in the prototypal chain
		 */
		readonly prototypeStartDelimiterMark: string;

		/**
		 * Mark repeated after the key of the property of a non-primitive value to indicate the depth of
		 * that key in the prototypal chain. For instance '@'. `@` means that the key is on the direct
		 * prototype of the non-primitive value and '@@' means that the key is on the prototype of the
		 * prototype of the non-primitive value
		 */
		readonly prototypeEndDelimiterMark: string;

		/**
		 * SingleLineInBetweenPropertySeparatorMark for that type of non-primitive value. For instance
		 * ', ' for records
		 */
		readonly singleLineInBetweenPropertySeparatorMark: string;

		/**
		 * MultiLineInBetweenPropertySeparatorMark for that non-primitive value. For instance ',' for
		 * records
		 */
		readonly multiLineInBetweenPropertySeparatorMark: string;

		/** IdSeparatorMark for that type of non-primitive value. For instance ' ' */
		readonly idSeparatorMark: string;

		/** PropertyNumberSeparatorMark for that type of non-primitive value. For instance ',' */
		readonly propertyNumberSeparatorMark: string;

		/** PropertyNumberStartDelimiterMark for that type of non-primitive value. For instance '(' */
		readonly propertyNumberStartDelimiterMark: string;

		/** PropertyNumberEndDelimiterMark for that type of non-primitive value. For instance ')' */
		readonly propertyNumberEndDelimiterMark: string;

		/**
		 * Specifies the source of properties for non-primitive values. See the PropertySource.Type for
		 * more details
		 */
		readonly propertySource: PropertySource;

		/**
		 * Indicates the level in the prototypal chain of a non-primitive value down to which properties
		 * are shown. This value is only used when propertySource is `FromProperties`. maxPrototypeDepth
		 * <= 0 means that only the own properties of a non-primitive value are shown. maxPrototypeDepth
		 * = 1 means that only the own properties of a non-primitive value and that of its direct
		 * prototype are shown...
		 */
		readonly maxPrototypeDepth: number;

		/**
		 * Array of `PropertyFilter` instances applied successively just after retrieving the properties
		 * of a non-primitive value from the selected source (see PropertyFilter.ts)
		 */
		readonly propertyFilters: PPPropertyFilters.Type;

		/**
		 * If `none`, properties are not sorted. If a `some` of a ValueOrder (see ValueOrder.ts), that
		 * ValueOrder is used to sort properties of non-primitive values just after application of the
		 * propertyFilters.
		 */
		readonly propertySortOrder: Option.Option<PPValueOrder.Type>;

		/**
		 * Non-primitive values can have several properties with the same key. For instance, the same
		 * key can appear in an object and one or several of its prototypes. This option allows you to
		 * decide if you want to keep all the properties with the same key. If true, only the first
		 * occurrence of each property with the same key is kept. Sorting happens before deduping, so
		 * you can decide which property will be first by choosing your propertySortOrder carefully
		 * (e.g. you may use `PropertyOrder.byPrototypalDepth`. If false, all occurrences of the same
		 * property are kept.
		 */
		readonly dedupeProperties: boolean;

		/**
		 * Maximal number of properties to keep for non-primitive values. Pass +Infinity to show all
		 * properties. Keeps the `maxPropertyNumber` first properties after filtering, ordering and
		 * deduping.
		 */
		readonly maxPropertyNumber: number;

		/**
		 * `PropertyFormatter` instance which allows you to specify how to format properties of
		 * non-primitive values (see PropertyFormatter.ts)
		 */
		readonly propertyFormatter: PPPropertyFormatter.Type;

		/**
		 * `NonPrimitiveFormatter` instance: allows you to specify how to print a non-primitive value
		 * from its stringified properties (see NonPrimitiveFormatter.ts)
		 */
		readonly nonPrimitiveFormatter: PPNonPrimitiveFormatter.Type;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

	/** Prototype */
	const _TypeIdHash = Hash.hash(_TypeId);
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
		},
		[MInspectable.IdSymbol](this: Type) {
			return this.id;
		},
		...MInspectable.BaseProto(namespaceTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor without an id
	 *
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Returns the `id` property of `self`
	 *
	 * @category Destructors
	 */
	export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

	/**
	 * Defaults NonPrimitive Option instance
	 *
	 * @category Instances
	 */
	export const record: Type = make({
		id: 'Object',
		showId: false,
		propertyNumberDisplayOption: PropertyNumberDisplayOption.None,
		keyValueSeparatorMark: ': ',
		singleLineStartDelimiterMark: '{ ',
		singleLineEndDelimiterMark: ' }',
		multiLineStartDelimiterMark: '{',
		multiLineEndDelimiterMark: '}',
		prototypeStartDelimiterMark: '',
		prototypeEndDelimiterMark: '@',
		singleLineInBetweenPropertySeparatorMark: ', ',
		multiLineInBetweenPropertySeparatorMark: ',',
		idSeparatorMark: ' ',
		propertyNumberSeparatorMark: ',',
		propertyNumberStartDelimiterMark: '(',
		propertyNumberEndDelimiterMark: ')',
		propertySource: PropertySource.FromProperties,
		maxPrototypeDepth: 0,
		propertyFilters: PPPropertyFilters.utilInspectLike,
		propertySortOrder: Option.none(),
		dedupeProperties: false,
		maxPropertyNumber: 100,
		propertyFormatter: PPPropertyFormatter.keyAndValue,
		nonPrimitiveFormatter: PPNonPrimitiveFormatter.splitOnTotalLengthMaker(80)
	});

	/**
	 * NonPrimitive Option instance for arrays
	 *
	 * @category Instances
	 */
	export const array: Type = make({
		...record,
		id: 'Array',
		propertyNumberDisplayOption: PropertyNumberDisplayOption.AllAndActualIfDifferent,
		singleLineStartDelimiterMark: '[ ',
		singleLineEndDelimiterMark: ' ]',
		multiLineStartDelimiterMark: '[',
		multiLineEndDelimiterMark: ']',
		propertySource: PropertySource.FromValueIterable,
		propertyFilters: PPPropertyFilters.empty,
		propertyFormatter: PPPropertyFormatter.valueOnly
	});

	/**
	 * Constructor that generates a NonPrimitive Option instance suitable for maps
	 *
	 * @category Constructors
	 */
	export const maps = (id: string): Type =>
		make({
			...record,
			id,
			showId: true,
			propertyNumberDisplayOption: PropertyNumberDisplayOption.AllAndActualIfDifferent,
			keyValueSeparatorMark: ' => ',
			propertySource: PropertySource.FromKeyValueIterable,
			propertyFilters: PPPropertyFilters.empty,
			propertyFormatter: PPPropertyFormatter.keyAndValue
		});

	/**
	 * Constructor that generates a NonPrimitive Option instance suitable for sets and arrays other
	 * than Array
	 *
	 * @category Constructors
	 */
	export const setsAndArrays = (id: string): Type =>
		make({
			...record,
			id,
			showId: true,
			propertyNumberDisplayOption: PropertyNumberDisplayOption.AllAndActualIfDifferent,
			propertySource: PropertySource.FromValueIterable,
			propertyFilters: PPPropertyFilters.empty,
			propertyFormatter: PPPropertyFormatter.valueOnly
		});

	/**
	 * Namespace of an initialized NonPrimitive Option
	 *
	 * @category Models
	 */
	export namespace Initialized {
		/**
		 * Type of an InitializedNonPrimitiveOption
		 *
		 * @category Models
		 */
		export interface Type extends MTypes.Data<NonPrimitive.Type> {
			readonly syntheticPropertyFilter: PPPropertyFilter.Action.Type;
			readonly initializedPropertyFormatter: PPPropertyFormatter.Action.Initialized.Type;
			readonly initializedNonPrimitiveFormatter: PPNonPrimitiveFormatter.Action.Initialized.Type;
			readonly toHeaderMarkShower: ({
				allPropertyNumber,
				actualPropertyNumber
			}: {
				readonly allPropertyNumber: number;
				readonly actualPropertyNumber: number;
			}) => PPMarkShower.Type;
		}

		/**
		 * Builds an Initialized from a NonPrimitive
		 *
		 * @category Constructors
		 */
		export const fromNonPrimitive = (params: {
			readonly valueBasedStylerConstructor: PPValueBasedStylerConstructor.Type;
			readonly markShowerConstructor: PPMarkShowerConstructor.Type;
		}): MTypes.OneArgFunction<NonPrimitive.Type, Type> => {
			const valueBasedStylerConstructor = params.valueBasedStylerConstructor;
			const nonPrimitiveValueIdTextFormatter = valueBasedStylerConstructor('NonPrimitiveValueId');
			const nonPrimitiveValueIdSeparatorTextFormatter = valueBasedStylerConstructor(
				'NonPrimitiveValueIdSeparator'
			);
			const propertyNumberDelimitersTextFormatter = valueBasedStylerConstructor(
				'PropertyNumberDelimiters'
			);
			const propertyNumberSeparatorTextFormatter =
				valueBasedStylerConstructor('PropertyNumberSeparator');
			const PropertyNumbersTextFormatter = valueBasedStylerConstructor('PropertyNumbers');

			return flow(
				MStruct.enrichWith({
					syntheticPropertyFilter: (nonPrimitiveOption): PPPropertyFilter.Action.Type =>
						PPPropertyFilters.toSyntheticPropertyFilter(nonPrimitiveOption.propertyFilters),
					initializedPropertyFormatter: (nonPrimitiveOption) =>
						nonPrimitiveOption.propertyFormatter(params),
					initializedNonPrimitiveFormatter: (nonPrimitiveOption) =>
						nonPrimitiveOption.nonPrimitiveFormatter(params),
					toHeaderMarkShower: (nonPrimitiveOption): Type['toHeaderMarkShower'] => {
						const emptyText = Function.constant(ASText.empty);

						const propertyNumberDisplayOption = nonPrimitiveOption.propertyNumberDisplayOption;
						const isNone = propertyNumberDisplayOption === PropertyNumberDisplayOption.None;
						const isAll = propertyNumberDisplayOption === PropertyNumberDisplayOption.All;
						const isActual = propertyNumberDisplayOption === PropertyNumberDisplayOption.Actual;
						const isAllAndActual =
							propertyNumberDisplayOption === PropertyNumberDisplayOption.AllAndActual;
						const isAllAndActualIfDifferent =
							propertyNumberDisplayOption === PropertyNumberDisplayOption.AllAndActualIfDifferent;
						const showId = nonPrimitiveOption.showId;

						const [propertyNumberStartDelimiter, propertyNumberEndDelimiter] =
							isNone ?
								Tuple.make(emptyText, emptyText)
							:	Tuple.make(
									propertyNumberDelimitersTextFormatter.withContextLast(
										nonPrimitiveOption.propertyNumberStartDelimiterMark
									),
									propertyNumberDelimitersTextFormatter.withContextLast(
										nonPrimitiveOption.propertyNumberEndDelimiterMark
									)
								);

						const propertyNumberSeparator =
							isAllAndActual || isAllAndActualIfDifferent ?
								propertyNumberSeparatorTextFormatter.withContextLast(
									nonPrimitiveOption.propertyNumberSeparatorMark
								)
							:	emptyText;

						const idSeparator =
							showId || !isNone ?
								nonPrimitiveValueIdSeparatorTextFormatter.withContextLast(
									nonPrimitiveOption.idSeparatorMark
								)
							:	emptyText;

						const id =
							showId ?
								nonPrimitiveValueIdTextFormatter.withContextLast(nonPrimitiveOption.id)
							:	emptyText;

						return ({ allPropertyNumber, actualPropertyNumber }) =>
							(value) => {
								const showAllAndActual =
									isAllAndActual ||
									(isAllAndActualIfDifferent && allPropertyNumber !== actualPropertyNumber);

								const styledTotalPropertyNumber =
									isAll || showAllAndActual ?
										pipe(
											allPropertyNumber,
											MString.fromNonNullablePrimitive,
											PropertyNumbersTextFormatter.withContextLast,
											Function.apply(value)
										)
									:	ASText.empty;

								const styledActualPropertyNumber =
									isActual || showAllAndActual ?
										pipe(
											actualPropertyNumber,
											MString.fromNonNullablePrimitive,
											PropertyNumbersTextFormatter.withContextLast,
											Function.apply(value)
										)
									:	ASText.empty;

								const [
									inContextPropertyNumberStartDelimiter,
									inContextPropertyNumberSeparator,
									inContextPropertyNumberEndDelimiter,
									inContextIdSeparator
								] =
									isAllAndActualIfDifferent && allPropertyNumber === actualPropertyNumber ?
										[
											ASText.empty,
											ASText.empty,
											ASText.empty,
											showId ? idSeparator(value) : ASText.empty
										]
									:	[
											propertyNumberStartDelimiter(value),
											propertyNumberSeparator(value),
											propertyNumberEndDelimiter(value),
											idSeparator(value)
										];

								return ASText.concat(
									id(value),
									inContextPropertyNumberStartDelimiter,
									styledTotalPropertyNumber,
									inContextPropertyNumberSeparator,
									styledActualPropertyNumber,
									inContextPropertyNumberEndDelimiter,
									inContextIdSeparator
								);
							};
					}
				})
			);
		};
	}
}

/**
 * Interface that represents the options for pretty printing
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Id of this Option instance. Useful for equality and debugging */
	readonly id: string;

	/** Map of ValueBasedStyler's used to style the different parts of a stringified value */
	readonly styleMap: PPStyleMap.Type;

	/** Map of the different marks that appear in a value to stringify */
	readonly markMap: PPMarkMap.Type;

	/**
	 * Array of `ByPasser` instances (see ByPasser.ts): the first ByPasser that returns a `some` is
	 * used to display that value. If all ByPasser's return a `none`, the normal stringification
	 * process is applied.
	 */
	readonly byPassers: PPByPassers.Type;

	/** PrimitiveFormatter (see PrimitiveFormatter.ts) instance used to format primitive values */
	readonly primitiveFormatter: PPPrimitiveFormatter.Type;

	/**
	 * Maximum number of nested non primitive values that will be opened. A value inferior or equal to
	 * 0 means that only the value to stringify is shown, provided it is a primitive. If it is a
	 * non-primitive value, it gets replaced by a message string that depends on the type of that non
	 * primitive value (e.g. [Object], [Array],...). Pass +Infinity to see all levels of any non
	 * primitive value.
	 */
	readonly maxDepth: number;

	/**
	 * Options that will apply to all non-primitive values other than those for which specific options
	 * are provided. See specificNonPrimitiveOptions below
	 */
	readonly generalNonPrimitiveOption: NonPrimitive.Type;

	/**
	 * Function that takes a value and returns either a `none` if the generalNonPrimitiveOptions must
	 * be applied for that value or a `some` of the specific options to apply for that value.
	 */
	readonly specificNonPrimitiveOption: MTypes.OneArgFunction<
		PPValue.NonPrimitive,
		Option.Option<NonPrimitive.Type>
	>;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * `Option` instance that pretty-prints a value in a way very similar to util.inspect.
 *
 * @category Instances
 */
export const utilInspectLike: Type = make({
	id: 'UtilInspectLike',
	styleMap: PPStyleMap.none,
	markMap: PPMarkMap.utilInspectLike,
	byPassers: Array.make(PPByPasser.functionToName, PPByPasser.objectToString),
	primitiveFormatter: PPPrimitiveFormatter.utilInspectLikeMaker(),
	maxDepth: 2,
	generalNonPrimitiveOption: NonPrimitive.record,
	specificNonPrimitiveOption: (value) => {
		const content = value.content;
		if (MTypes.isArray(content)) return Option.some(NonPrimitive.array);
		if (content instanceof Map) return Option.some(NonPrimitive.maps('Map'));
		if (content instanceof Set) return Option.some(NonPrimitive.setsAndArrays('Set'));
		if (content instanceof WeakMap) return Option.some(NonPrimitive.maps('WeakMap'));
		if (content instanceof WeakSet) return Option.some(NonPrimitive.setsAndArrays('WeakSet'));
		if (HashMap.isHashMap(content)) return Option.some(NonPrimitive.maps('EffectHashMap'));
		if (SortedMap.isSortedMap(content)) return Option.some(NonPrimitive.maps('EffectSortedMap'));
		if (HashSet.isHashSet(content)) return Option.some(NonPrimitive.setsAndArrays('EffectHashSet'));
		if (SortedSet.isSortedSet(content))
			return Option.some(NonPrimitive.setsAndArrays('EffectSortedSet'));
		return pipe(content, MTypes.typedArrayName, Option.map(NonPrimitive.setsAndArrays));
	}
});

/**
 * `Option` instance that pretty-prints a value in a way very similar to util.inspect with colors
 * adapted to a terminal in dark mode.
 *
 * @category Instances
 */
export const darkModeUtilInspectLike: Type = make({
	...utilInspectLike,
	id: 'DarkModeUtilInspectLike',
	styleMap: PPStyleMap.darkMode
});

/**
 * `Option` instance that treeifies a value
 *
 * @category Instances
 */
export const treeify: Type = make({
	id: 'Treeify',
	styleMap: PPStyleMap.none,
	markMap: PPMarkMap.utilInspectLike,
	byPassers: Array.empty(),
	primitiveFormatter: PPPrimitiveFormatter.utilInspectLikeMaker(),
	maxDepth: +Infinity,
	generalNonPrimitiveOption: NonPrimitive.make({
		...NonPrimitive.record,
		propertyFilters: Array.empty(),
		propertySortOrder: Option.none(),
		dedupeProperties: false,
		maxPropertyNumber: +Infinity,
		propertyFormatter: PPPropertyFormatter.treeify,
		nonPrimitiveFormatter: PPNonPrimitiveFormatter.treeify
	}),
	specificNonPrimitiveOption: flow(
		utilInspectLike.specificNonPrimitiveOption,
		Option.map(
			flow(
				MStruct.set({
					nonPrimitiveFormatter: PPNonPrimitiveFormatter.treeify,
					propertyFormatter: PPPropertyFormatter.treeify
				}),
				NonPrimitive.make
			)
		)
	)
});

/**
 * `Option` instance that treeifies a value with colors adapted to dark mode
 *
 * @category Instances
 */
export const darkModeTreeify: Type = make({
	...treeify,
	id: 'DarkModeTreeify',
	styleMap: PPStyleMap.darkMode
});

/**
 * `Option` instance that treeifies a value and hides the leaves
 *
 * @category Instances
 */
export const treeifyHideLeaves: Type = make({
	...treeify,
	id: 'TreeifyHideLeaves',
	generalNonPrimitiveOption: NonPrimitive.make({
		...treeify.generalNonPrimitiveOption,
		propertyFormatter: PPPropertyFormatter.treeifyHideLeafValues
	}),
	specificNonPrimitiveOption: flow(
		treeify.specificNonPrimitiveOption,
		Option.map(
			flow(
				MStruct.set({
					propertyFormatter: PPPropertyFormatter.treeifyHideLeafValues
				}),
				NonPrimitive.make
			)
		)
	)
});

/**
 * `Option` instance that treeifies a value and hides the leaves with colors adapted to dark mode
 *
 * @category Instances
 */
export const darkModeTreeifyHideLeaves: Type = make({
	...treeifyHideLeaves,
	id: 'DarkModeTreeifyHideLeaves',
	styleMap: PPStyleMap.darkMode
});

/**
 * Builds a Stringifier from an Option
 *
 * @category Destructors
 */

export const toStringifier = (self: Type): Stringifier.Type => {
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(self);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(self);

	const constructors = { markShowerConstructor, valueBasedStylerConstructor };

	const primitiveValueTextFormatter = valueBasedStylerConstructor('PrimitiveValue');
	const messageTextFormatter = valueBasedStylerConstructor('Message');

	const circularObjectMarkShower = markShowerConstructor('CircularObject');
	const circularReferenceStartDelimiterMarkShower = markShowerConstructor(
		'CircularReferenceStartDelimiter'
	);
	const circularReferenceEndDelimiterMarkShower = markShowerConstructor(
		'CircularReferenceEndDelimiter'
	);
	const messageStartDelimiterMarkShower = markShowerConstructor('MessageStartDelimiter');
	const messageEndDelimiterMarkShower = markShowerConstructor('MessageEndDelimiter');

	const initializedByPasser = PPByPassers.toSyntheticByPasser(self.byPassers).call(
		self,
		constructors
	);

	const toInitializedNonPrimitiveOption = NonPrimitive.Initialized.fromNonPrimitive(constructors);

	const initializedNonPrimitiveOptionCache = MCache.make({
		lookUp: ({ key }: { readonly key: NonPrimitive.Type }) =>
			Tuple.make(toInitializedNonPrimitiveOption(key), true)
	});

	const initializedNonPrimitiveOptionGetter = MCache.toGetter(initializedNonPrimitiveOptionCache);
	const initializedGeneralNonPrimitiveOption = initializedNonPrimitiveOptionGetter(
		self.generalNonPrimitiveOption
	);

	const functionToNameByPasser = PPByPasser.functionToName.call(self, constructors);

	let lastCyclicalIndex = 1;
	const cyclicalMap = MutableHashMap.empty<PPValue.NonPrimitive, number>();

	const stringifier: Stringifier.Type = flow(
		PPValue.fromTopValue,
		MTree.unfoldAndFold<
			readonly [
				nonPrimitiveValue: PPValue.NonPrimitive,
				nonPrimitiveOption: NonPrimitive.Initialized.Type,
				allPropertyNumber: number
			],
			readonly [stringified: PPStringifiedValue.Type, value: PPValue.All, isLeaf: boolean],
			PPValue.All
		>({
			unfold: (seed, cyclicalRef) =>
				pipe(
					Either.gen(function* () {
						const notByPassed = yield* pipe(
							seed,
							initializedByPasser,
							Either.fromOption(Function.constant(seed)),
							Either.flip
						);

						const unBypassedNonPrimitive = yield* pipe(
							notByPassed,
							Either.liftPredicate(
								PPValue.isNonPrimitive,
								Function.unsafeCoerce<PPValue.All, PPValue.Primitive>
							),
							Either.mapLeft(
								flow(
									self.primitiveFormatter,
									primitiveValueTextFormatter(notByPassed),
									PPStringifiedValue.fromText
								)
							)
						);

						const initializedNonPrimitiveOption = pipe(
							unBypassedNonPrimitive,
							self.specificNonPrimitiveOption,
							Option.map(initializedNonPrimitiveOptionGetter),
							Option.getOrElse(Function.constant(initializedGeneralNonPrimitiveOption))
						);

						const unBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
							unBypassedNonPrimitive,
							Either.liftPredicate(
								flow(PPValue.depth, Number.lessThan(self.maxDepth)),
								flow(
									functionToNameByPasser,
									Option.getOrElse(
										pipe(
											initializedNonPrimitiveOption.id,
											messageTextFormatter(unBypassedNonPrimitive),
											ASText.surround(
												messageStartDelimiterMarkShower(unBypassedNonPrimitive),
												messageEndDelimiterMarkShower(unBypassedNonPrimitive)
											),
											PPStringifiedValue.fromText,
											Function.constant
										)
									)
								)
							)
						);

						const unCyclicalUnBypassedNonPrimitiveUnderMaxDepth = yield* pipe(
							cyclicalRef,
							Option.map(([cyclicalValue]) =>
								pipe(
									cyclicalMap,
									MutableHashMap.get(cyclicalValue),
									Option.getOrElse(() => {
										/* eslint-disable-next-line functional/no-expression-statements */
										MutableHashMap.set(cyclicalMap, cyclicalValue, lastCyclicalIndex);
										return lastCyclicalIndex++;
									}),
									MString.fromNonNullablePrimitive,
									messageTextFormatter(unBypassedNonPrimitiveUnderMaxDepth),
									ASText.prepend(circularObjectMarkShower(unBypassedNonPrimitiveUnderMaxDepth)),
									ASText.surround(
										messageStartDelimiterMarkShower(unBypassedNonPrimitiveUnderMaxDepth),
										messageEndDelimiterMarkShower(unBypassedNonPrimitiveUnderMaxDepth)
									),
									PPStringifiedValue.fromText
								)
							),
							Either.fromOption(Function.constant(unBypassedNonPrimitiveUnderMaxDepth)),
							Either.flip
						);

						const properties = pipe(
							initializedNonPrimitiveOption.propertySource,
							MMatch.make,
							MMatch.whenIs(
								PropertySource.FromProperties,
								pipe(
									initializedNonPrimitiveOption.maxPrototypeDepth,
									PPValues.fromProperties,
									Function.constant
								)
							),
							MMatch.whenIs(
								PropertySource.FromValueIterable,
								Function.constant(PPValues.fromValueIterable)
							),
							MMatch.whenIs(
								PropertySource.FromKeyValueIterable,
								Function.constant(PPValues.fromKeyValueIterable(stringifier))
							),
							MMatch.exhaustive,
							Function.apply(unCyclicalUnBypassedNonPrimitiveUnderMaxDepth)
						);

						const sort: MTypes.OneArgFunction<PPValues.Type> = pipe(
							initializedNonPrimitiveOption.propertySortOrder,
							Option.map((order) => Array.sort(order)),
							Option.getOrElse(Function.constant(Function.identity))
						);

						const filteredAndSortedProperties = pipe(
							properties,
							initializedNonPrimitiveOption.syntheticPropertyFilter,
							sort,
							MFunction.fIfTrue({
								condition: initializedNonPrimitiveOption.dedupeProperties,
								f: Array.dedupeWith((self, that) => self.oneLineStringKey === that.oneLineStringKey)
							}),
							Array.take(initializedNonPrimitiveOption.maxPropertyNumber)
						);

						return Tuple.make(
							Tuple.make(
								unCyclicalUnBypassedNonPrimitiveUnderMaxDepth,
								initializedNonPrimitiveOption,
								properties.length
							),
							filteredAndSortedProperties
						);
					}),
					Either.mapLeft(flow(Tuple.make, Tuple.appendElement(seed), Tuple.appendElement(true)))
				),
			foldNonLeaf: ([nonPrimitive, initializedNonPrimitiveOption, allPropertyNumber], children) =>
				pipe(
					children,
					Array.map(([stringified, value, isLeaf]) =>
						pipe(
							stringified,
							initializedNonPrimitiveOption.initializedPropertyFormatter({ value, isLeaf })
						)
					),
					initializedNonPrimitiveOption.initializedNonPrimitiveFormatter({
						value: nonPrimitive,
						header: pipe(
							cyclicalMap,
							MutableHashMap.get(nonPrimitive),
							Option.map(
								flow(
									MString.fromNonNullablePrimitive,
									messageTextFormatter(nonPrimitive),
									ASText.prepend(circularReferenceStartDelimiterMarkShower(nonPrimitive)),
									ASText.append(circularReferenceEndDelimiterMarkShower(nonPrimitive))
								)
							),
							Option.getOrElse(Function.constant(ASText.empty)),
							ASText.append(
								pipe(
									nonPrimitive,
									initializedNonPrimitiveOption.toHeaderMarkShower({
										allPropertyNumber,
										actualPropertyNumber: children.length
									})
								)
							)
						)
					}),
					Tuple.make,
					Tuple.appendElement(nonPrimitive),
					Tuple.appendElement(false)
				),
			foldLeaf: Function.identity
		}),
		([first]) => first
	);

	return stringifier;
};
