/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * Type that represents a value in its stringification context. A Value instance is created for the
 * initial value to stringify and, if that value is a record, a Value instance is also created for
 * each property and nested property of that record.
 *
 * Value's can be ordered by ValueOrder instances (see ValueOrder.ts)
 *
 * As an end user, you should never have to create a Value instance.
 *
 * @since 0.0.1
 */
import {
	MFunction,
	MInspectable,
	MMatch,
	MOption,
	MPipeable,
	MString,
	MTree,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Chunk,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Number,
	Option,
	Pipeable,
	Predicate,
	Struct,
	Types,
	flow,
	pipe
} from 'effect';
import * as FormattedString from './FormattedString.js';
import * as Options from './Options.js';
import type * as StringifiedValue from './StringifiedValue.js';
import type * as StringifiedValues from './StringifiedValues.js';

const moduleTag = '@parischap/pretty-print/Value/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * An interface that represents a Value
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<out V extends MTypes.Unknown>
	extends Equal.Equal,
		Inspectable.Inspectable,
		Pipeable.Pipeable {
	/** The value to stringify */
	readonly value: V;
	/**
	 * Depth of `value` in the initial value to stringify: number of nested arrays and objects to open
	 * to reach `value`
	 */
	readonly depth: number;
	/**
	 * Depth of `value` in the prototypal chain of the initial value to stringify: number of
	 * prototypes to open to reach `value`
	 */
	readonly protoDepth: number;
	/** The options passed to the asLines or asString functions */
	readonly options: Options.Type;
	/**
	 * The key to which `value` is attached (an empty string if `value` is not in a record, the index
	 * converted to a string if `value` is in an array, the property key if `value` is in an object or
	 * a function)
	 */
	readonly key: string | symbol;
	/** Same as `key` but, if `key` is a symbol, it is converted to a string */
	readonly stringKey: string;
	/** `true` if `value` belongs to a record and represents a function. `false` otherwise. */
	readonly hasFunctionValue: boolean;
	/** `true` if `value` belongs to a record and is attached to a symbolic key. `false` otherwise. */
	readonly hasSymbolicKey: boolean;
	/** 'true' if `value` belongs to a record and is attached to an enumerable key. 'false' otherwise. */
	readonly hasEnumerableKey: boolean;
	/** Contains the result of calling Options.byPasser on `value` */
	readonly byPassedValue: Option.Option<StringifiedValue.Type>;
	/** `true` if depth >= options.maxDepth */
	readonly isTooDeep: boolean;
	/** `true` if this value is the start of a cycle */
	readonly isCycleStart: boolean;
	/** 'true' if `value` belongs to a record that is an array */
	readonly belongsToArray: boolean;
	/** @internal */
	readonly [TypeId]: {
		readonly _V: Types.Covariant<V>;
	};
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type<MTypes.Unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence for the value property
 *
 * @since 0.0.1 Equivalence
 */
export const getEquivalence = <V extends MTypes.Unknown>(
	isEquivalent: Equivalence.Equivalence<V>
): Equivalence.Equivalence<Type<V>> =>
	Equivalence.make((self, that) => isEquivalent(self.value, that.value));

/** Equivalence based on the equality of their values */
const _equivalence = getEquivalence(Equal.equals);

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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_V: MTypes.covariantValue
	},
	[Equal.symbol]<V extends MTypes.Unknown>(this: Type<V>, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol]<V extends MTypes.Unknown>(this: Type<V>) {
		return Hash.cached(this, Hash.hash(this.value));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <V extends MTypes.Unknown>(params: MTypes.Data<Type<V>>): Type<V> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Type that represents any Value
 *
 * @since 0.0.1
 * @category Models
 */
export type All = Type<MTypes.Unknown>;

/**
 * Type that represents a record in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export type RecordType = Type<MTypes.AnyRecord>;
/**
 * Type that represents an array in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export type ArrayType = Type<MTypes.AnyArray>;
/**
 * Type that represents a function in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export type FunctionType = Type<MTypes.AnyFunction>;
/**
 * Type that represents a primitive in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export type PrimitiveType = Type<MTypes.Primitive>;

/**
 * Type that represents a the properties of a record
 *
 * @since 0.0.1
 * @category Models
 */
export interface Properties extends ReadonlyArray<All> {}

/**
 * True if the `value` of `self` represents a record
 *
 * @since 0.0.1
 * @category Guards
 */
export const isRecord = (self: All): self is RecordType =>
	pipe(self, Struct.get('value'), MTypes.isRecord);

/**
 * True if the `value` of `self` represents an array
 *
 * @since 0.0.1
 * @category Guards
 */
export const isArray = (self: All): self is ArrayType =>
	pipe(self, Struct.get('value'), MTypes.isArray);

/**
 * True if the `value` of `self` represents a function
 *
 * @since 0.0.1
 * @category Guards
 */
export const isFunction = (self: All): self is FunctionType =>
	pipe(self, Struct.get('value'), MTypes.isFunction);

/**
 * True if the `value` of `self` represents a primitive
 *
 * @since 0.0.1
 * @category Guards
 */
export const isPrimitive = (self: All): self is PrimitiveType =>
	pipe(self, Struct.get('value'), MTypes.isPrimitive);

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const makeFromValue = (options: Options.Type) => (value: unknown) =>
	_make({
		value: value as MTypes.Unknown,
		depth: 0,
		protoDepth: 0,
		options,
		key: '',
		stringKey: '',
		hasFunctionValue: false,
		hasSymbolicKey: false,
		hasEnumerableKey: false,
		byPassedValue: MOption.fromOptionOrNullable(
			options.byPasser.action(value as MTypes.Unknown, options)
		),
		isTooDeep: Number.greaterThanOrEqualTo(0, options.maxDepth),
		isCycleStart: false,
		belongsToArray: false
	});

/**
 * Creates a copy of `self` with `isCycleStart` set
 *
 * @since 0.0.1
 * @category Constructors
 */
export const setIsCycleStart =
	(isCycleStart: boolean) =>
	<V extends MTypes.Unknown>(self: Type<V>): Type<V> => ({
		...self,
		isCycleStart
	});

/**
 * Creates a `Value` for each own or inherited (from the prototypes) property of the `value` of
 * `self`, removes the Value's not fulfilling the stringification options and returns an array of
 * the remaining Value's
 *
 * @since 0.0.1
 * @category Utils
 */
const makeFromRecord = (self: RecordType): Properties => {
	const options = self.options;
	let currentRecord = self.value;
	let constituents = Chunk.empty<All>();
	let currentProtoDepth = 0;
	const nextDepth = self.depth + 1;

	do {
		/* eslint-disable-next-line functional/no-expression-statements */
		constituents = Chunk.appendAll(
			constituents,
			pipe(
				currentRecord,
				// Record.map does not map on non enumerable properties
				Reflect.ownKeys,
				Array.map((key) => {
					const value = currentRecord[key] as MTypes.Unknown;
					return _make({
						value,
						depth: nextDepth,
						protoDepth: currentProtoDepth,
						options,
						key,
						stringKey: MString.fromNonNullablePrimitive(key),
						hasFunctionValue: MTypes.isFunction(value),
						hasSymbolicKey: MTypes.isSymbol(key),
						hasEnumerableKey: Object.prototype.propertyIsEnumerable.call(currentRecord, key),
						byPassedValue: MOption.fromOptionOrNullable(options.byPasser.action(value, options)),
						isTooDeep: Number.greaterThanOrEqualTo(nextDepth, options.maxDepth),
						isCycleStart: false,
						belongsToArray: MTypes.isArray(currentRecord)
					});
				}),
				Chunk.fromIterable
			)
		);
		const prototype = Reflect.getPrototypeOf(currentRecord);
		/* eslint-disable-next-line functional/no-expression-statements */
		if (prototype !== null) currentRecord = prototype;
		else break;
	} while (++currentProtoDepth <= options.maxPrototypeDepth);

	return pipe(
		constituents,
		// Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
		Array.filter(
			Predicate.struct({ stringKey: Predicate.not(MFunction.strictEquals('__proto__')) })
		),
		options.propertyFilter.action(self)
	);
};

/**
 * Stringifies the `value` of `self`. Non-recursive.
 *
 * @since 0.0.1
 * @category Utils
 */
export const stringify = (self: All): StringifiedValue.Type => {
	const options = self.options;
	const tree = MTree.nonRecursiveUnfoldAndMap(
		self,
		(seed, isCyclic) =>
			pipe(
				seed,
				setIsCycleStart(isCyclic),
				MTuple.makeBothBy({
					toFirst: Function.identity,
					toSecond: flow(
						Option.liftPredicate(
							Predicate.struct({
								value: MTypes.isRecord,
								byPassedValue: Option.isNone<StringifiedValue.Type>,
								isTooDeep: Boolean.not,
								isCycleStart: Boolean.not
							}) as unknown as Predicate.Refinement<All, RecordType>
						),
						Option.map(
							flow(
								MMatch.make,
								MMatch.when(isArray, makeFromRecord),
								MMatch.orElse(
									flow(
										makeFromRecord,
										Array.sort(options.propertySortOrder),
										MFunction.fIfTrue({
											condition: options.dedupeRecordProperties,
											f: Array.dedupeWith((self, that) => self.key === that.key)
										})
									)
								)
							)
						),
						Option.getOrElse(() => Array.empty<All>())
					)
				})
			),
		(value, stringifiedProps: StringifiedValues.Type) =>
			pipe(
				stringifiedProps,
				Array.match({
					onNonEmpty: options.recordFormatter.action(value),

					onEmpty: () =>
						pipe(
							value,
							MMatch.make,
							MMatch.tryFunction(Struct.get('byPassedValue')),
							MMatch.orElse(
								flow(
									MMatch.make,
									MMatch.when(
										isPrimitive,
										flow(
											Struct.get('value'),
											MString.fromPrimitive,
											FormattedString.makeWith(),
											Array.of
										)
									),
									MMatch.unsafeWhen(
										isRecord,
										flow(
											MMatch.make,
											MMatch.when(
												Struct.get('isTooDeep'),
												flow(
													MMatch.make,
													MMatch.when(isArray, () => options.arrayLabel),
													MMatch.when(isFunction, () => options.functionLabel),
													MMatch.orElse(() => options.objectLabel),
													Array.of
												)
											),
											MMatch.when(Struct.get('isCycleStart'), () =>
												Array.of(options.circularLabel)
											),
											MMatch.orElse(() => Array.empty<FormattedString.Type>())
										)
									)
								)
							)
						)
				}),
				options.propertyFormatter.action(value)
			)
	);
	return tree.value;
};
