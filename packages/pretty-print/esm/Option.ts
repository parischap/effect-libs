/**
 * This module implements the options for pretty-printing.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { ASText } from '@parischap/ansi-styles';
import { MArray, MMatch, MString, MStruct, MTree, MTuple, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Either,
	flow,
	Function,
	HashMap,
	MutableHashMap,
	Number,
	Option,
	pipe,
	String
} from 'effect';

import * as PPByPasser from './ByPasser.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPPropertyFilter from './PropertyFilter.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPPropertyOrder from './PropertyOrder.js';
import * as PPStringifiedValue from './StringifiedValue.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValue from './Value.js';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';

import { MInspectable, MPipeable } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';

export const moduleTag = '@parischap/pretty-print/Option/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

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
	export interface Type extends ReadonlyArray<PPPropertyFilter.Type> {}
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
		 * `FromIterator` is usually a good choice for Arrays, Maps, Sets, WeakMaps, WeakSets and
		 * TypedArrays
		 */
		FromIterator = 1,
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

export namespace NonPrimitiveOption {
	/**
	 * Type of a NonPrimitiveOption
	 *
	 * @category Models
	 */
	export interface Type {
		/**
		 * Name of the object. That name is used on two occasions:
		 *
		 * - It is displayed with the style associated to the `message` partName in case `maxDepth` is
		 *   superseded (see StyleMap.ts) surrounded by the `messageStartDelimiter` and
		 *   `messageEndDelimiter` marks (see MarkMap.ts). For instance: [Array]
		 * - It is displayed before the `singleLineStartDelimiter` or `multiLineStartDelimiter` if
		 *   `showName` is `true`
		 */
		readonly name: string;

		/**
		 * If true, the name will be shown in the `NonPrimitiveValueName` style just before the
		 * startDelimiter seperated from it by the `NonPrimitiveValueNameSeparator` mark. For instance:
		 * `Map { 'a' => 1, 'b' => 2 }`
		 */
		readonly showName: boolean;

		/**
		 * Options regarding the display of the property number. If not `None`, the property number will
		 * be suffixed to the name in between the `PropertyNumberStartDelimiter` and
		 * `PropertyNumberEndDelimiter` marks. For AllAndActual, the `PropertyNumberSeparator` mark is
		 * used to seperate the two property numbers. For instance: `Map(2) { 'a' => 1, 'b' => 2 }` with
		 * `Actual` or `Map(5,2) { 'a' => 1, 'b' => 2 }` with `AllAndActual`
		 */
		readonly propertyNumberDisplayOption: PropertyNumberDisplayOption.Type;

		/** Name of the keyValueSeparator mark for that non-primitive value */
		readonly keyValueSeparatorMarkName: string;

		/** Name of the singleLineStartDelimiter mark for that non-primitive value */
		readonly singleLineStartDelimiterMarkName: string;

		/** Name of the singleLineEndDelimiter mark for that non-primitive value */
		readonly singleLineEndDelimiterMarkName: string;

		/** Name of the multiLineStartDelimiter mark for that non-primitive value */
		readonly multiLineStartDelimiterMarkName: string;

		/** Name of the multiLineEndDelimiter mark for that non-primitive value */
		readonly multiLineEndDelimiterMarkName: string;

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
		 * `ValueOrder` instance: allows you to specify how to sort properties of non primitive values
		 * (see ValueOrder.ts). Applied just after the propertyFilters
		 */
		readonly propertySortOrder: PPPropertyOrder.Type;

		/**
		 * Non-primitive values can have several properties with the same key, for instance in an object
		 * and one or several of its prototypes. This option allows you to decide if you want to keep
		 * all the properties with the same key. If true, only the first occurrence of each property
		 * with the same key is kept. Sorting happens before deduping, so you can decide which property
		 * will be first by choosing your propertySortOrder carefully (usually, you will use
		 * `PropertyOrder.byPrototypalDepth`. If false, all occurrences of the same property are kept.
		 */
		readonly dedupeProperties: boolean;

		/**
		 * Maximal number of properties to keep for non-primitive values. Pass +Infinity to show all
		 * properties. Applied after property deduping.
		 */
		readonly maxPropertyNumber: number;

		/**
		 * `PropertyFormatter` instance: allows you to specify how to format properties of non-primitive
		 * values (see PropertyFormatter.ts)
		 */
		readonly propertyFormatter: PPPropertyFormatter.Type;

		/**
		 * `NonPrimitiveFormatter` instance: allows you to specify how to print a non-^primitive value
		 * from its stringified properties (see NonPrimitiveFormatter.ts)
		 */
		readonly nonPrimitiveFormatter: PPNonPrimitiveFormatter.Type;
	}

	export namespace Initialized {
		/**
		 * Type of an InitializedNonPrimitiveOption
		 *
		 * @category Models
		 */
		export interface Type extends NonPrimitiveOption.Type {
			readonly initializedPropertyFilter: PPPropertyFilter.Action.Type;
			readonly initializedPropertyFormatter: ReturnType<PPPropertyFormatter.Action.Type>;
			readonly initializedNonPrimitiveFormatter: ReturnType<PPNonPrimitiveFormatter.Action.Type>;
		}

		/**
		 * Constructor
		 *
		 * @category Constructors
		 */
		export const make = (params: {
			readonly valueBasedFormatterConstructor: ValueBasedFormatterConstructor.Type;
			readonly markShowerConstructor: MarkShowerConstructor.Type;
			readonly nonPrimitiveOption: NonPrimitiveOption.Type;
		}): Type =>
			pipe(
				params.nonPrimitiveOption,
				MStruct.enrichWith({
					initializedPropertyFilter: (self) => (properties: PPValue.Properties.Type) =>
						Array.reduce(self.propertyFilters, properties, (remainingProperties, propertyFilter) =>
							propertyFilter(remainingProperties)
						),
					initializedPropertyFormatter: (self) => self.propertyFormatter(params),
					initializedNonPrimitiveFormatter: (self) => self.nonPrimitiveFormatter(params)
				})
			);
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

	/**
	 * Maximal number of characters to show for strings. Pass +Infinity to show the entire contents of
	 * strings
	 */
	readonly maxStringLength: number;

	/**
	 * Maximum number of nested non primitive values that will be opened. A value inferior or equal to
	 * 0 means that only primitive values of the value to stringify are shown, non-primitive values
	 * are replaced by a message string (see generalNonPrimitiveOption and specificOption).
	 */
	readonly maxDepth: number;

	/**
	 * Options that will apply to all non-primitive values other than those for which specific options
	 * are provided. See specificOptions below
	 */
	readonly generalNonPrimitiveOption: NonPrimitiveOption.Type;

	/**
	 * Function that takes a value and returns either a `none` if the generalNonPrimitiveOptions must
	 * be applied for that value or a `some` of the specific options to apply for that value.
	 */
	readonly specificOption: MTypes.OneArgFunction<
		PPValue.NonPrimitiveType,
		Option.Option<NonPrimitiveOption.Type>
	>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
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
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Function that returns an `Option` instance that pretty-prints a value on a single line in a way
 * very similar to util.inspect. It takes a `FormatSet` instance as an argument.
 *
 * @category Instances
 */
export const utilInspectLike = (formatSet: PPFormatSet.Type): Type =>
	make({
		id: formatSet.id + 'SingleLine',
		maxDepth: 10,
		arrayLabel: pipe('[Array]', PPString.makeWith(formatSet.otherValueFormatter)),
		functionLabel: pipe('(Function)', PPString.makeWith(formatSet.otherValueFormatter)),
		objectLabel: pipe('{Object}', PPString.makeWith(formatSet.otherValueFormatter)),
		maxPrototypeDepth: 0,
		circularLabel: pipe('(Circular)', PPString.makeWith(formatSet.otherValueFormatter)),
		propertySortOrder: PPPropertyOrder.byStringKey,
		dedupeProperties: false,
		byPasser: PPByPasser.objectAsValue(formatSet),
		propertyFilter: PPPropertyFilter.removeNonEnumerables,
		propertyFormatter: PPPropertyFormatter.recordLike(formatSet),
		recordFormatter: PPRecordFormatter.singleLine(formatSet)
	});

/**
 * Builds a Stringifier from an Option
 *
 * @category Destructors
 */

export const toStringifier = (self: Type): Stringifier.Type => {
	const styleMap = self.styleMap;
	const markShowerMap: MarkShowerMap.Type = HashMap.map(self.markMap.marks, ({ text, partName }) =>
		pipe(
			styleMap,
			PPStyleMap.get(partName),
			(contextFormatter) => (value) => contextFormatter(value)(text)
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

	const stringValueTextFormatter = valueBasedFormatterConstructor('StringValue');
	const otherValueTextFormatter = valueBasedFormatterConstructor('OtherValue');
	const symbolValueTextFormatter = valueBasedFormatterConstructor('SymbolValue');
	const messageTextFormatter = valueBasedFormatterConstructor('Message');

	const stringStartDelimiterMarkShower = markShowerConstructor('StringStartDelimiter');
	const stringEndDelimiterMarkShower = markShowerConstructor('StringEndDelimiter');
	const stringOverflowSuffixMarkShower = markShowerConstructor('StringOverflowSuffix');
	const nullValueMarkShower = markShowerConstructor('NullValue');
	const undefinedValueMarkShower = markShowerConstructor('UndefinedValue');
	const bigIntStartDelimiterMarkShower = markShowerConstructor('BigIntStartDelimiter');
	const bigIntEndDelimiterMarkShower = markShowerConstructor('BigIntEndDelimiter');
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

	const initializedByPasser: ReturnType<PPByPasser.Action.Type> = (seed) =>
		pipe(initializedByPassers, MArray.firstSomeResult(Function.apply(seed)));

	const initializedGeneralNonPrimitiveOption = NonPrimitiveOption.Initialized.make({
		...constructors,
		nonPrimitiveOption: self.generalNonPrimitiveOption
	});

	const functionToNameByPasser = PPByPasser.functionToName(constructors);

	let lastCyclicalIndex = 1;
	const cyclicalMap = MutableHashMap.empty<PPValue.NonPrimitiveType, number>();

	const stringifier: Stringifier.Type = flow(
		PPValue.Top.make,
		MTree.unfoldAndFold<PPValue.NonPrimitiveType, PPStringifiedValue.Type, PPValue.All>({
			unfold: (seed, cyclicalRef) =>
				Either.gen(function* () {
					const notByPassed = yield* pipe(
						seed,
						initializedByPasser,
						Either.fromOption(Function.constant(seed)),
						Either.flip
					);

					const nonPrimitive = yield* pipe(
						notByPassed,
						Either.liftPredicate(
							PPValue.isNonPrimitive,
							Function.unsafeCoerce<PPValue.All, PPValue.PrimitiveType>
						),
						Either.mapLeft(
							flow(
								PPValue.value,
								flow(
									MMatch.make,
									MMatch.when(
										MTypes.isString,
										flow(
											Either.liftPredicate(
												flow(String.length, Number.greaterThan(self.maxStringLength)),
												Function.identity
											),
											Either.mapBoth({
												onLeft: stringValueTextFormatter(seed),
												onRight: flow(
													String.takeLeft(self.maxStringLength),
													stringValueTextFormatter(seed),
													ASText.append(stringOverflowSuffixMarkShower(seed))
												)
											}),
											Either.merge,
											ASText.surround(
												stringStartDelimiterMarkShower(seed),
												stringEndDelimiterMarkShower(seed)
											)
										)
									),
									MMatch.whenOr(
										MTypes.isNumber,
										MTypes.isBoolean,
										flow(MString.fromNonNullablePrimitive, otherValueTextFormatter(seed))
									),
									MMatch.when(MTypes.isNull, pipe(seed, nullValueMarkShower, Function.constant)),
									MMatch.when(
										MTypes.isUndefined,
										pipe(seed, undefinedValueMarkShower, Function.constant)
									),
									MMatch.when(
										MTypes.isBigInt,
										flow(
											MString.fromNonNullablePrimitive,
											otherValueTextFormatter(seed),
											ASText.surround(
												bigIntStartDelimiterMarkShower(seed),
												bigIntEndDelimiterMarkShower(seed)
											)
										)
									),
									MMatch.when(
										MTypes.isSymbol,
										flow(MString.fromNonNullablePrimitive, symbolValueTextFormatter(seed))
									),
									MMatch.exhaustive
								),
								PPStringifiedValue.fromText
							)
						)
					);

					const initializedNonPrimitiveOption = pipe(
						self.specificOption,
						Function.apply(nonPrimitive),
						Option.map((specificOption) =>
							NonPrimitiveOption.Initialized.make({
								...constructors,
								nonPrimitiveOption: specificOption
							})
						),
						Option.getOrElse(Function.constant(initializedGeneralNonPrimitiveOption))
					);

					const nonPrimitiveUnderMaxDepth = yield* pipe(
						nonPrimitive,
						Either.liftPredicate(
							flow(PPValue.depth, Number.lessThan(self.maxDepth)),
							flow(
								functionToNameByPasser,
								Option.getOrElse(
									pipe(
										initializedNonPrimitiveOption.name,
										messageTextFormatter(seed),
										ASText.surround(
											messageStartDelimiterMarkShower(seed),
											messageEndDelimiterMarkShower(seed)
										),
										PPStringifiedValue.fromText,
										Function.constant
									)
								)
							)
						)
					);

					const res = pipe(
						cyclicalRef,
						Option.map((cyclicalValue) =>
							pipe(
								cyclicalMap,
								MutableHashMap.get(cyclicalValue),
								Option.getOrElse(() => {
									/* eslint-disable-next-line functional/no-expression-statements */
									MutableHashMap.set(cyclicalMap, cyclicalValue, lastCyclicalIndex);
									return lastCyclicalIndex++;
								}),
								MString.fromNonNullablePrimitive,
								messageTextFormatter(seed),
								ASText.prepend(circularObjectMarkShower(seed)),
								ASText.surround(
									messageStartDelimiterMarkShower(seed),
									messageEndDelimiterMarkShower(seed)
								),
								PPStringifiedValue.fromText
							)
						),
						Either.fromOption(
							pipe(
								nonPrimitiveUnderMaxDepth,
								MTuple.makeBothBy({
									toFirst: Function.identity,
									toSecond: flow(
										MMatch.make,
										MMatch.when(PPValue.isArray, fromNonPrimitive),
										MMatch.orElse(
											flow(
												fromNonPrimitive,
												Array.sort(self.propertySortOrder),
												MFunction.fIfTrue({
													condition: self.dedupeProperties,
													f: Array.dedupeWith((self, that) => self.key === that.key)
												})
												//option.propertyFilter
											)
										)
									)
								}),
								Function.constant
							)
						),
						Either.flip
					);
				}) as never,
			foldNonLeaf: (nonPrimitive, children) =>
				pipe(
					children,
					recordFormatter(nonPrimitive),
					pipe(
						cyclicalMap,
						MutableHashMap.get(nonPrimitive),
						Option.map(
							flow(
								MString.fromNonNullablePrimitive,
								messageTextFormatter(nonPrimitive),
								ASText.prepend(circularReferenceStartDelimiterMarkShower(nonPrimitive)),
								ASText.append(circularReferenceEndDelimiterMarkShower(nonPrimitive)),
								PPStringifiedValue.prependToFirstLine
							)
						),
						Option.getOrElse(Function.constant(Function.identity))
					),
					propertyFormatter(nonPrimitive)
				),
			foldLeaf: Function.identity // Properties need formatting here
		})
	);

	return stringifier;
};
