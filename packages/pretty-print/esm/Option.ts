/**
 * This module implements the options for pretty-printing.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import {
	MArray,
	MCache,
	MFunction,
	MMatch,
	MString,
	MStruct,
	MTree,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
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
	Tuple
} from 'effect';

import * as PPByPasser from './ByPasser.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPPrimitiveFormatter from './PrimitiveFormatter.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';
import * as PPValueFilter from './ValueFilter.js';
import * as PPValueFormatter from './ValueFormatter.js';
import * as PPValues from './Values.js';

import { MInspectable, MPipeable } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';
import { isIterable } from 'effect/Predicate';

export const moduleTag = '@parischap/pretty-print/Option/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of an array of ByPasser's (see ByPasser.ts)
 *
 * @category Models
 */
export namespace ByPassers {
	/**
	 * Type of a ByPassers
	 *
	 * @category Models
	 */
	export interface Type extends ReadonlyArray<PPByPasser.Type> {}
}

/**
 * Namespace of an array of PropertyFilter's (see PropertyFilter.ts)
 *
 * @category Models
 */
export namespace PropertyFilters {
	/**
	 * Type of a PropertyFilters
	 *
	 * @category Models
	 */
	export interface Type extends ReadonlyArray<PPValueFilter.Type> {}
}

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
 * Namespace of a ValueBasedFormatterConstructor
 *
 * @category Models
 */
export namespace ValueBasedFormatterConstructor {
	/**
	 * Type of a ValueBasedFormatterConstructor
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, PPValueBasedFormatter.Type> {}
}

/**
 * Namespace of a MarkShower
 *
 * @category Models
 */
export namespace MarkShower {
	/**
	 * Type of a MarkShower
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValue.All, ASText.Type> {}

	/**
	 * MarkShower instance that always prints an empty Text
	 *
	 * @category Instances
	 */
	export const empty: Type = (_context) => ASText.empty;
}

/**
 * Namespace of a MarkShowerConstructor
 *
 * @category Models
 */
export namespace MarkShowerConstructor {
	/**
	 * Type of a MarkShowerConstructor
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, MarkShower.Type> {}
}

/**
 * Namespace of a MarkShowerMap
 *
 * @category Models
 */
export namespace MarkShowerMap {
	/**
	 * Type of a MarkShowerMap
	 *
	 * @category Models
	 */
	export interface Type extends HashMap.HashMap<string, MarkShower.Type> {}
}

/**
 * Namespace for the possible sources of properties for non-primitive values
 *
 * @category Models
 */
export namespace PropertySource {
	/**
	 * Type of a PropertySource
	 *
	 * @category Models
	 */
	export enum Type {
		/**
		 * Properties are obtained by calling Reflect.getOwnProperties on the object and its prototypes.
		 * `FromProperties` is usually a good choice for records
		 */
		FromProperties = 0,
		/**
		 * Properties are obtained by iterating over the object that must implement the Iterable
		 * protocol. If the iterator returns a pair, that pair is deemed to be a key/value pair. If it
		 * returns a single value, an auto-incremented numerical key (converted to a string) is
		 * automatically generated. In all other cases, the output of the iterator is ignored.
		 * `FromIterable` is usually a good choice for Arrays, Maps, Sets, WeakMaps, WeakSets and
		 * TypedArrays
		 */
		FromIterable = 1,
		/**
		 * Properties are obtained by calling Reflect.getOwnProperties on the object and its prototypes
		 * and by by iterating over the object that must implement the Iterable protocol - Could come in
		 * handy if you have an iterable that also has properties that you want to display.
		 */
		FromPropertiesAndIterator = 2
	}
}

/**
 * Namespace for the options regarding the display of the number of properties. The number of
 * properties is shown in between parentheses just after the object name
 *
 * @category Models
 */
export namespace PropertyNumberDisplayOption {
	/**
	 * Type of a PropertyNumberDisplayOption
	 *
	 * @category Models
	 */
	export enum Type {
		/** The number of properties is not shown */
		None = 0,
		/** Shows the number of properties retrieved from the property source */
		All = 1,
		/**
		 * Shows the number of properties actually displayed (after filtering, deduping and applying
		 * `maxPropertyNumber`)
		 */
		Actual = 2,
		/**
		 * Shows both the number of properties retrieved from the property source and the number of
		 * properties actually displayed (after filtering, deduping and applying `maxPropertyNumber`)
		 */
		AllAndActual = 3
	}
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
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Id of this instance. This id is:
		 *
		 * - Used for equality and debugging
		 * - Displayed with the `message` style in case `maxDepth` is superseded (see StyleMap.ts)
		 *   surrounded by the `messageStartDelimiter` and `messageEndDelimiter` marks (see MarkMap.ts).
		 *   For instance: [Array]
		 * - Displayed before the `singleLineStartDelimiterMark` or `multiLineStartDelimiterMark` if
		 *   `showId` is `true`
		 */
		readonly id: string;

		/**
		 * If true, the id will be shown in the `NonPrimitiveValueId` style just before the
		 * `singleLineStartDelimiterMark` or `multiLineStartDelimiterMark` seperated from it by the
		 * `NonPrimitiveValueNameSeparator` mark. For instance: `Map { 'a' => 1, 'b' => 2 }`
		 */
		readonly showId: boolean;

		/**
		 * Options regarding the display of the property number. If not `None`, the property number will
		 * be suffixed to the name in between the `PropertyNumberStartDelimiter` and
		 * `PropertyNumberEndDelimiter` marks. For AllAndActual, the `PropertyNumberSeparator` mark is
		 * used to seperate the two property numbers. For instance: `Map(2) { 'a' => 1, 'b' => 2 }` with
		 * `Actual` or `Map(5,2) { 'a' => 1, 'b' => 2 }` with `AllAndActual`
		 */
		readonly propertyNumberDisplayOption: PropertyNumberDisplayOption.Type;

		/** KeyValueSeparatorMark for that non-primitive value */
		readonly keyValueSeparatorMark: string;

		/** SingleLineStartDelimiterMark for that non-primitive value */
		readonly singleLineStartDelimiterMark: string;

		/** SingleLineEndDelimiterMark for that non-primitive value */
		readonly singleLineEndDelimiterMark: string;

		/** MultiLineStartDelimiterMark for that non-primitive value */
		readonly multiLineStartDelimiterMark: string;

		/** MultiLineEndDelimiterMark for that non-primitive value */
		readonly multiLineEndDelimiterMark: string;

		/** PrototypeStartDelimiterMark for that non-primitive value */
		readonly prototypeStartDelimiterMark: string;

		/** PrototypeEndDelimiterMark for that non-primitive value */
		readonly prototypeEndDelimiterMark: string;

		/** SingleLineInBetweenPropertySeparatorMark for that non-primitive value */
		readonly singleLineInBetweenPropertySeparatorMark: string;

		/** MultiLineInBetweenPropertySeparatorMark for that non-primitive value */
		readonly multiLineInBetweenPropertySeparatorMark: string;

		/** IdSeparatorMark for that non-primitive value */
		readonly idSeparatorMark: string;

		/** PropertyNumberSeparatorMark for that non-primitive value */
		readonly propertyNumberSeparatorMark: string;

		/** PropertyNumberStartDelimiterMark for that non-primitive value */
		readonly propertyNumberStartDelimiterMark: string;

		/** PropertyNumberEndDelimiterMark for that non-primitive value */
		readonly propertyNumberEndDelimiterMark: string;

		/** Specifies the source of properties for non-primitive values. This value can be overriden */
		readonly propertySource: PropertySource.Type;

		/**
		 * Indicates the level in the prototypal chain of a non-primitive value down to which properties
		 * are shown. This value is only used when propertySource is `FromProperties` or
		 * `FromPropertiesAndIterator`. maxPrototypeDepth <= 0 means that only the own properties of a
		 * non-primitive value are shown. maxPrototypeDepth = 1 means that only the own properties of a
		 * non-primitive value and its direct prototype are shown...
		 */
		readonly maxPrototypeDepth: number;

		/**
		 * Array of `PropertyFilter` instances applied successively just after retrieving the properties
		 * of a non-primitive value from the selected source.
		 */
		readonly propertyFilters: PropertyFilters.Type;

		/**
		 * If `none`, properties are not sorted. If a `some` of a ValueOrder (see ValueOrder.ts), that
		 * ValueOrder is used to sort properties of non primitive values just after application of the
		 * propertyFilters.
		 */
		readonly propertySortOrder: Option.Option<PPValue.Order.Type>;

		/**
		 * Non-primitive values can have several properties with the same key, for instance in an object
		 * and one or several of its prototypes. This option allows you to decide if you want to keep
		 * all the properties with the same key. If true, only the first occurrence of each property
		 * with the same key is kept. Sorting happens before deduping, so you can decide which property
		 * will be first by choosing your propertySortOrder carefully (e.g. you may use
		 * `PropertyOrder.byPrototypalDepth`. If false, all occurrences of the same property are kept.
		 */
		readonly dedupeProperties: boolean;

		/**
		 * Maximal number of properties to keep for non-primitive values. Pass +Infinity to show all
		 * properties. Applied after property deduping. The `maxPropertyNumber` first properties after
		 * filtering and ordering are kept.
		 */
		readonly maxPropertyNumber: number;

		/**
		 * `ValueFormatter` instance (see ValueFormatter.ts) which allows you to specify how to format
		 * properties of non-primitive values (see ValueFormatter.ts)
		 */
		readonly propertyFormatter: PPValueFormatter.Type;

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
	 * Constructor without a id
	 *
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Defaults NonPrimitive Option instance
	 *
	 * @category Instances
	 */
	export const defaults: Type = make({
		id: 'Object',
		showId: false,
		propertyNumberDisplayOption: PropertyNumberDisplayOption.Type.None,
		keyValueSeparatorMark: ':',
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
		propertySource: PropertySource.Type.FromProperties,
		maxPrototypeDepth: 2,
		propertyFilters: Array.make(PPValueFilter.removeNonEnumerables),
		propertySortOrder: Option.none(),
		dedupeProperties: false,
		maxPropertyNumber: 100,
		propertyFormatter: PPValueFormatter.keyAndValue,
		nonPrimitiveFormatter: PPNonPrimitiveFormatter.splitOnTotalLengthMaker(80)
	});

	/**
	 * NonPrimitive Option instance for arrays
	 *
	 * @category Instances
	 */
	export const array: Type = make({
		...defaults,
		id: 'Array',
		singleLineStartDelimiterMark: '[',
		singleLineEndDelimiterMark: ']',
		multiLineStartDelimiterMark: '[',
		multiLineEndDelimiterMark: ']',
		propertySource: PropertySource.Type.FromIterable,
		propertyFilters: Array.empty(),
		propertyFormatter: PPValueFormatter.valueOnly
	});

	/**
	 * Constructor that generates a NonPrimitive Option instance suitable for maps
	 *
	 * @category Constructors
	 */
	export const mapsAndSets = (id: string): Type =>
		make({
			...defaults,
			id,
			showId: true,
			propertyNumberDisplayOption: PropertyNumberDisplayOption.Type.All,
			keyValueSeparatorMark: '=>',
			propertySource: PropertySource.Type.FromIterable,
			propertyFilters: Array.empty(),
			propertyFormatter: PPValueFormatter.valueForAutoGenerated
		});

	export namespace Initialized {
		/**
		 * Type of an InitializedNonPrimitiveOption
		 *
		 * @category Models
		 */
		export interface Type extends MTypes.Data<NonPrimitive.Type> {
			readonly initializedPropertyFilter: PPValueFilter.Action.Type;
			readonly initializedPropertyFormatter: ReturnType<PPValueFormatter.Action.Type>;
			readonly initializedNonPrimitiveFormatter: ReturnType<PPNonPrimitiveFormatter.Action.Type>;
			readonly initializedNonPrimitiveIdHeaderConstructor: ({
				allPropertyNumber,
				actualPropertyNumber
			}: {
				readonly allPropertyNumber: number;
				readonly actualPropertyNumber: number;
			}) => MarkShower.Type;
		}

		/**
		 * Constructor
		 *
		 * @category Constructors
		 */
		export const fromOption = (params: {
			readonly valueBasedFormatterConstructor: ValueBasedFormatterConstructor.Type;
			readonly markShowerConstructor: MarkShowerConstructor.Type;
		}): MTypes.OneArgFunction<NonPrimitive.Type, Type> => {
			const nonPrimitiveValueIdTextFormatter =
				params.valueBasedFormatterConstructor('nonPrimitiveValueId');
			const nonPrimitiveValueIdSeparatorTextFormatter = params.valueBasedFormatterConstructor(
				'nonPrimitiveValueIdSeparator'
			);
			const propertyNumberDelimitersTextFormatter = params.valueBasedFormatterConstructor(
				'propertyNumberDelimiters'
			);
			const propertyNumberSeparatorTextFormatter =
				params.valueBasedFormatterConstructor('propertyNumberSeparator');
			const PropertyNumbersTextFormatter = params.valueBasedFormatterConstructor('PropertyNumbers');

			return flow(
				MStruct.enrichWith({
					initializedPropertyFilter:
						(nonPrimitiveOption): Type['initializedPropertyFilter'] =>
						(properties) =>
							Array.reduce(
								nonPrimitiveOption.propertyFilters,
								properties,
								(remainingProperties, propertyFilter) => propertyFilter(remainingProperties)
							),
					initializedPropertyFormatter: (nonPrimitiveOption) =>
						nonPrimitiveOption.propertyFormatter(params),
					initializedNonPrimitiveFormatter: (nonPrimitiveOption) =>
						nonPrimitiveOption.nonPrimitiveFormatter(params),
					initializedNonPrimitiveIdHeaderConstructor: (
						nonPrimitiveOption
					): Type['initializedNonPrimitiveIdHeaderConstructor'] => {
						const emptyText = Function.constant(ASText.empty);

						const [propertyNumberStartDelimiter, propertyNumberEndDelimiter] =
							(
								nonPrimitiveOption.propertyNumberDisplayOption ===
								PropertyNumberDisplayOption.Type.None
							) ?
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
							(
								nonPrimitiveOption.propertyNumberDisplayOption ===
								PropertyNumberDisplayOption.Type.AllAndActual
							) ?
								propertyNumberSeparatorTextFormatter.withContextLast(
									nonPrimitiveOption.propertyNumberSeparatorMark
								)
							:	emptyText;

						const idSeparator =
							(
								nonPrimitiveOption.showId ||
								nonPrimitiveOption.propertyNumberDisplayOption !==
									PropertyNumberDisplayOption.Type.None
							) ?
								nonPrimitiveValueIdSeparatorTextFormatter.withContextLast(
									nonPrimitiveOption.idSeparatorMark
								)
							:	emptyText;

						const id =
							nonPrimitiveOption.showId ?
								nonPrimitiveValueIdTextFormatter.withContextLast(nonPrimitiveOption.id)
							:	emptyText;

						//const start = pipe(id, ASText.append(propertyNumberStartDelimiter));
						//const end = pipe(propertyNumberEndDelimiter, ASText.append(idSeparator));
						return ({ allPropertyNumber, actualPropertyNumber }) =>
							(value) => {
								const styledTotalPropertyNumber =
									(
										[
											PropertyNumberDisplayOption.Type.All,
											PropertyNumberDisplayOption.Type.AllAndActual
										].includes(nonPrimitiveOption.propertyNumberDisplayOption)
									) ?
										pipe(
											allPropertyNumber,
											MString.fromNonNullablePrimitive,
											PropertyNumbersTextFormatter.withContextLast,
											Function.apply(value)
										)
									:	ASText.empty;

								const styledActualPropertyNumber =
									(
										[
											PropertyNumberDisplayOption.Type.Actual,
											PropertyNumberDisplayOption.Type.AllAndActual
										].includes(nonPrimitiveOption.propertyNumberDisplayOption)
									) ?
										pipe(
											actualPropertyNumber,
											MString.fromNonNullablePrimitive,
											PropertyNumbersTextFormatter.withContextLast,
											Function.apply(value)
										)
									:	ASText.empty;

								return ASText.concat(
									id(value),
									propertyNumberStartDelimiter(value),
									styledTotalPropertyNumber,
									propertyNumberSeparator(value),
									styledActualPropertyNumber,
									propertyNumberEndDelimiter(value),
									idSeparator(value)
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
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Id of this Option instance. Useful for equality and debugging */
	readonly id: string;

	/** Map of ValueBasedFormatter's used to style the different parts of a stringified value */
	readonly styleMap: PPStyleMap.Type;

	/** Map of the different marks that appear in a value to stringify */
	readonly markMap: PPMarkMap.Type;

	/**
	 * Array of `ByPasser` instances (see ByPasser.ts): the first ByPasser that returns a `some` is
	 * used to display that value. If all ByPasser's return a `none`, the normal stringification
	 * process is applied.
	 */
	readonly byPassers: ByPassers.Type;

	/** PrimitiveFormatter (see PrimitiveFormatter.ts) instance used to format primitive values */
	readonly primitiveFormatter: PPPrimitiveFormatter.Type;

	/**
	 * Maximum number of nested non primitive values that will be opened. A value inferior or equal to
	 * 0 means that only primitive values of the value to stringify are shown, non-primitive values
	 * are replaced by a message string (see generalNonPrimitiveOption and
	 * specificNonPrimitiveOption). Pass +Infinity to see all levels of any object.
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
 * Function that returns an `Option` instance that pretty-prints a value in a way very similar to
 * util.inspect.
 *
 * @category Instances
 */
export const utilInspectLike: Type = make({
	id: 'UtilInspectLike',
	styleMap: PPStyleMap.none,
	markMap: PPMarkMap.defaults,
	byPassers: Array.make(PPByPasser.functionToName, PPByPasser.objectToString),
	primitiveFormatter: PPPrimitiveFormatter.utilInspectLike(),
	maxDepth: 2,
	generalNonPrimitiveOption: NonPrimitive.defaults,
	specificNonPrimitiveOption: (value) => {
		if (MTypes.isArray(value)) return Option.some(NonPrimitive.array);
		if (value instanceof Map) return Option.some(NonPrimitive.mapsAndSets('Map'));
		if (value instanceof Set) return Option.some(NonPrimitive.mapsAndSets('Set'));
		if (value instanceof WeakMap) return Option.some(NonPrimitive.mapsAndSets('WeakMap'));
		if (value instanceof WeakSet) return Option.some(NonPrimitive.mapsAndSets('WeakSet'));
		if (HashMap.isHashMap(value)) return Option.some(NonPrimitive.mapsAndSets('EffectHashMap'));
		if (SortedMap.isSortedMap(value))
			return Option.some(NonPrimitive.mapsAndSets('EffectSortedMap'));
		if (HashSet.isHashSet(value)) return Option.some(NonPrimitive.mapsAndSets('EffectHashSet'));
		if (SortedSet.isSortedSet(value))
			return Option.some(NonPrimitive.mapsAndSets('EffectSortedSet'));
		if (!MTypes.isString(value) && isIterable(value))
			return Option.some(NonPrimitive.mapsAndSets('Iterable'));
		return Option.none();
	}
});

/**
 * Builds a Stringifier from an Option
 *
 * @category Destructors
 */

export const toStringifier = (self: Type): Stringifier.Type => {
	const styleMap = self.styleMap;
	const markShowerMap: MarkShowerMap.Type = HashMap.map(self.markMap.marks, ({ text, partName }) =>
		pipe(styleMap, PPStyleMap.get(partName), (contextFormatter) =>
			contextFormatter.withContextLast(text)
		)
	);

	const markShowerConstructor: MarkShowerConstructor.Type = (markName) =>
		pipe(
			markShowerMap,
			HashMap.get(markName),
			Option.getOrElse(Function.constant(MarkShower.empty))
		);

	const valueBasedFormatterConstructor: ValueBasedFormatterConstructor.Type = (partName) =>
		pipe(styleMap, PPStyleMap.get(partName));

	const constructors = { markShowerConstructor, valueBasedFormatterConstructor };

	const primitiveValueTextFormatter = valueBasedFormatterConstructor('PrimitiveValue');
	const messageTextFormatter = valueBasedFormatterConstructor('Message');

	const circularObjectMarkShower = markShowerConstructor('CircularObject');
	const circularReferenceStartDelimiterMarkShower = markShowerConstructor(
		'CircularReferenceStartDelimiter'
	);
	const circularReferenceEndDelimiterMarkShower = markShowerConstructor(
		'CircularReferenceEndDelimiter'
	);
	const messageStartDelimiterMarkShower = markShowerConstructor('messageStartDelimiter');
	const messageEndDelimiterMarkShower = markShowerConstructor('messageEndDelimiter');

	const initializedByPassers = Array.map(self.byPassers, Function.apply(constructors));

	const initializedByPasser: ReturnType<PPByPasser.Action.Type> = (value) =>
		pipe(initializedByPassers, MArray.firstSomeResult(Function.apply(value)));

	const toInitializedNonPrimitiveOption = NonPrimitive.Initialized.fromOption(constructors);

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
			readonly [stringified: PPStringifiedValue.Type, value: PPValue.All],
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
							MMatch.whenIs(PropertySource.Type.FromProperties, () =>
								PPValues.fromProperties(initializedNonPrimitiveOption.maxPrototypeDepth)
							),
							MMatch.whenIs(PropertySource.Type.FromIterable, () =>
								PPValues.fromIterable(stringifier)
							),
							MMatch.whenIs(PropertySource.Type.FromPropertiesAndIterator, () =>
								flow(
									MTuple.makeBothBy<PPValue.NonPrimitive, PPValues.Type>({
										toFirst: PPValues.fromProperties(
											initializedNonPrimitiveOption.maxPrototypeDepth
										),
										toSecond: PPValues.fromIterable(stringifier)
									}),
									Array.flatten
								)
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
							initializedNonPrimitiveOption.initializedPropertyFilter,
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
					Either.mapLeft(flow(Tuple.make, Tuple.appendElement(seed)))
				),
			foldNonLeaf: ([nonPrimitive, initializedNonPrimitiveOption, allPropertyNumber], children) =>
				pipe(
					children,
					Array.map(([stringified, value]) =>
						pipe(stringified, initializedNonPrimitiveOption.initializedPropertyFormatter(value))
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
									initializedNonPrimitiveOption.initializedNonPrimitiveIdHeaderConstructor({
										allPropertyNumber,
										actualPropertyNumber: children.length
									})
								)
							)
						)
					}),
					Tuple.make,
					Tuple.appendElement(nonPrimitive)
				),
			foldLeaf: Function.identity
		}),
		Tuple.getFirst
	);

	return stringifier;
};
