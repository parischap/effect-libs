/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * Type that represents a value in its stringification context. A Value instance is created for the
 * value to stringify and, if that value is a record, for each property and nested property of that
 * record. value to stringify and, if that value is a record, for each property and nested property
 * of that record.
 *
 * Value's can be ordered by ValueOrder instances (see ValueOrder.ts)
 *
 * As an end user, you should never have to create a Value instance.
 *
 * @since 0.0.1
 */
import {
	MArray,
	MFunction,
	MInspectable,
	MMatch,
	MOption,
	MPipeable,
	MPredicate,
	MString,
	MStruct,
	MTree,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Number,
	Option,
	Pipeable,
	Predicate,
	String,
	Struct,
	Types,
	flow,
	pipe
} from 'effect';
import type * as PPOption from './Option.js';
import * as PPString from './String.js';
import type * as PPStringifiedValue from './StringifiedValue.js';
import type * as PPStringifiedValues from './StringifiedValues.js';

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
	/** Contains the result of calling Option.byPasser on `value` */
	readonly byPassedValue: Option.Option<PPStringifiedValue.Type>;
	/** The category of `value` */
	readonly valueCategory: MTypes.Category.Type;

	/**
	 * Depth of `value` in the value to stringify: number of nested arrays and objects to open to
	 * reach `value`. Depth of `value` in the value to stringify: number of nested arrays and objects
	 * to open to reach `value`.
	 */
	readonly depth: number;

	/**
	 * Depth of `value` in the prototypal chain of the value to stringify: number of prototypes to
	 * open to reach `value` Depth of `value` in the prototypal chain of the value to stringify:
	 * number of prototypes to open to reach `value`
	 */
	readonly protoDepth: number;

	/**
	 * The key to which `value` is attached (an empty string if `value` is not in a record, the index
	 * converted to a string if `value` is in an array, the property key if `value` is in an object or
	 * a function)
	 */
	readonly key: string | symbol;
	/** Same as `key` but, if `key` is a symbol, it is converted to a string */
	readonly stringKey: string;
	/** `true` if `value` belongs to a record and is attached to a symbolic key. `false` otherwise. */
	readonly hasSymbolicKey: boolean;
	/** 'true' if `value` belongs to a record and is attached to an enumerable key. 'false' otherwise. */
	readonly hasEnumerableKey: boolean;
	/** 'true' if `value` belongs to a record that is an array. 'false' otherwise. */
	readonly belongsToArray: boolean;

	/** `true` if this value is the start of a cycle. 'false' otherwise. */
	readonly isCycleStart: boolean;

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
 * Returns an equivalence based on an equivalence of the value property
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const getEquivalence = <V extends MTypes.Unknown>(
	isEquivalent: Equivalence.Equivalence<V>
): Equivalence.Equivalence<Type<V>> =>
	Equivalence.make((self, that) => isEquivalent(self.value, that.value));

/**
 * Equivalence based on the equality of their values for cycle detection
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence = getEquivalence((self, that) => self === that);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_V: MTypes.covariantValue
	},
	[Equal.symbol]<V extends MTypes.Unknown>(this: Type<V>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<V extends MTypes.Unknown>(this: Type<V>) {
		return pipe(this.value, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
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
export interface All extends Type<MTypes.Unknown> {}

/**
 * Type that represents a primitive in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export interface PrimitiveType extends Type<MTypes.Primitive> {}

/**
 * Type that represents an array in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export interface ArrayType extends Type<MTypes.AnyArray> {}

/**
 * Type that represents a record in its stringification context
 *
 * @since 0.0.1
 * @category Models
 */
export interface RecordType extends Type<MTypes.AnyRecord> {}

/**
 * Type that represents a the properties of a record
 *
 * @since 0.0.1
 * @category Models
 */
export interface Properties extends ReadonlyArray<All> {}

/**
 * Empty instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: All = _make({
	value: null as MTypes.Unknown,
	byPassedValue: Option.none(),
	valueCategory: MTypes.Category.Type.Primitive,
	depth: 0,
	protoDepth: 0,
	key: '',
	stringKey: '',
	hasSymbolicKey: false,
	hasEnumerableKey: false,
	belongsToArray: false,
	isCycleStart: false
});

/**
 * Predicate that returns `true` if `self` belongs to a record and its value is a function. Returns
 * `false` otherwise
 *
 * @since 0.0.1
 * @category Predicates
 */
export const isRecordWithFunctionValue: Predicate.Predicate<All> = MPredicate.struct({
	stringKey: String.isNonEmpty,
	valueCategory: MFunction.strictEquals(MTypes.Category.Type.Function)
});

/**
 * True if the `value` of `self` represents a primitive
 *
 * @since 0.0.1
 * @category Guards
 */
export const isPrimitive = (self: All): self is PrimitiveType =>
	self.valueCategory === MTypes.Category.Type.Primitive;

/**
 * True if the `value` of `self` represents an array
 *
 * @since 0.0.1
 * @category Guards
 */
export const isArray = (self: All): self is ArrayType =>
	self.valueCategory === MTypes.Category.Type.Array;

/**
 * True if the `value` of `self` represents a record
 *
 * @since 0.0.1
 * @category Guards
 */
export const isRecord = (self: All): self is RecordType =>
	self.valueCategory !== MTypes.Category.Type.Primitive;

/**
 * True if the `value` of `self` is not null
 *
 * @since 0.0.1
 * @category Guards
 */
export const isNotNull = <V extends MTypes.Unknown>(
	self: Type<V>
): self is Type<Exclude<V, null>> => self.value !== null;

/**
 * Returns a copy of `self` with `value` set to 'value'. `byPassedValue` and `valueCategory` are
 * updated to reflect this change
 *
 * @since 0.0.1
 * @category Utils
 */
export const setValue = <V extends MTypes.Unknown>(
	value: V,
	option: PPOption.Type
): ((self: All) => Type<V>) =>
	flow(
		MStruct.set({
			value: value,
			byPassedValue: MOption.fromOptionOrNullable(option.byPasser.action(value, option)),
			valueCategory: MTypes.Category.fromValue(value)
		}),
		_make<V>
	);

/**
 * Returns a copy of `self` with `key` set to `key`. `stringKey`, `hasSymbolicKey`,
 * `hasEnumerableKey` and `belongsToArray` are updated to reflect this change
 *
 * @since 0.0.1
 * @category Utils
 * @category Utils
 */
export const setAsRecordKey = (
	key: string | symbol,
	parentRecord: MTypes.AnyRecord
): ((self: All) => All) =>
	flow(
		MStruct.set({
			key,
			stringKey: MString.fromNonNullablePrimitive(key),
			hasSymbolicKey: MTypes.isSymbol(key),
			hasEnumerableKey: Object.prototype.propertyIsEnumerable.call(parentRecord, key),
			belongsToArray: MTypes.isArray(parentRecord)
		}),
		_make
	);

/**
 * Returns a copy of `self` with `isCycleStart` set
 *
 * @since 0.0.1
 * @category Utils
 */
export const setIsCycleStart = (
	isCycleStart: boolean
): (<V extends MTypes.Unknown>(self: Type<V>) => Type<V>) =>
	flow(MStruct.set({ isCycleStart }), _make);

/**
 * Returns a copy of `self` with `protoDepth` set to 0
 *
 * @since 0.0.1
 * @category Utils
 */
export const resetProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.set({ protoDepth: 0 }),
	_make
);

/**
 * Creates a `Value` from `value` which is the value to stringify
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeFromTopValue =
	(option: PPOption.Type) =>
	(value: unknown): All =>
		pipe(empty, setValue(value as MTypes.Unknown, option));

/**
 * Returns a copy of `self` with `depth` incremented by 1
 *
 * @since 0.0.1
 * @category Utils
 */
export const incDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.evolve({ depth: Number.increment }),
	_make
);

/**
 * Returns a copy of `self` with `protoDepth` incremented by 1
 *
 * @since 0.0.1
 * @category Utils
 */
export const incProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.evolve({ protoDepth: Number.increment }),
	_make
);

/**
 * Returns a `some` of a copy of `self` with `value` replaced by its prototype if the prototype is
 * not null. Otherwise, returns a `none`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const toProto = (self: RecordType): Type<MTypes.AnyRecord | null> =>
	pipe(self, MStruct.evolve({ value: Reflect.getPrototypeOf }), _make);

/**
 * Returns a copy of `self` for each of its properties
 *
 * @since 0.0.1
 * @category Utils
 */
export const toOwnProperties =
	(option: PPOption.Type) =>
	(self: RecordType): Properties => {
		const underlying = self.value;
		return pipe(
			underlying,
			// Record.map will not return all keys
			Reflect.ownKeys,
			Array.map((key) =>
				pipe(self, setValue(underlying[key], option), setAsRecordKey(key, underlying))
			)
		);
	};

/**
 * Returns a function that takes a Value.RecordType and returns a Value.All for each of its own or
 * inherited (from the prototypes) properties that filfill `self`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const toOwnAndPrototypesProperties =
	(option: PPOption.Type) =>
	(self: RecordType): Properties =>
		pipe(
			self,
			incDepth,
			resetProtoDepth,
			MArray.unfold<Type<MTypes.AnyRecord | null>, Properties>(
				flow(
					Option.liftPredicate(
						MPredicate.struct({
							protoDepth: Number.lessThanOrEqualTo(option.maxPrototypeDepth)
						})
					),
					Option.filter(isNotNull),
					Option.map(
						MTuple.makeBothBy({
							toFirst: toOwnProperties(option),
							toSecond: flow(toProto, incProtoDepth)
						})
					)
				)
			),
			Array.flatten,
			// Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
			Array.filter(
				MPredicate.struct({ stringKey: Predicate.not(MFunction.strictEquals('__proto__')) })
			),
			option.propertyFilter.action(self)
		);

/**
 * Function that transforms `self` into a StringifiedValue
 *
 * @since 0.0.1
 * @category Utils
 */
export const stringify = (option: PPOption.Type): ((self: All) => PPStringifiedValue.Type) =>
	flow(
		MTree.nonRecursiveUnfoldAndMap(
			(seed, isCyclical) =>
				pipe(
					seed,
					setIsCycleStart(isCyclical),
					MTuple.makeBothBy({
						toFirst: Function.identity,
						toSecond: flow(
							Option.liftPredicate(
								MPredicate.struct({
									byPassedValue: Option.isNone,
									depth: Number.lessThan(option.maxDepth),
									isCycleStart: Boolean.not
								})
							),
							Option.map(
								flow(
									MMatch.make,
									MMatch.when(isArray, toOwnAndPrototypesProperties(option)),
									MMatch.when(
										isRecord,
										flow(
											toOwnAndPrototypesProperties(option),
											Array.sort(option.propertySortOrder),
											MFunction.fIfTrue({
												condition: option.dedupeRecordProperties,
												f: Array.dedupeWith((self, that) => self.key === that.key)
											})
										)
									),
									MMatch.orElse(() => Array.empty<All>())
								)
							),
							Option.getOrElse(() => Array.empty<All>())
						)
					})
				),
			(currentValue, stringifiedProps: PPStringifiedValues.Type) =>
				pipe(
					stringifiedProps,
					Array.match({
						onNonEmpty: option.recordFormatter.action(currentValue),

						onEmpty: () =>
							pipe(
								currentValue,
								MMatch.make,
								MMatch.tryFunction(Struct.get('byPassedValue')),
								MMatch.when(
									isPrimitive,
									flow(Struct.get('value'), MString.fromPrimitive, PPString.makeWith(), Array.of)
								),
								MMatch.unsafeWhen(
									isRecord,
									flow(
										MMatch.make,
										MMatch.when(
											MPredicate.struct({
												depth: Number.greaterThanOrEqualTo(option.maxDepth)
											}),
											flow(
												MMatch.make,
												MMatch.when(isArray, () => option.arrayLabel),
												MMatch.when(
													MPredicate.struct({
														valueCategory: MFunction.strictEquals(MTypes.Category.Type.Function)
													}),
													() => option.functionLabel
												),
												MMatch.orElse(() => option.objectLabel),
												Array.of
											)
										),
										MMatch.when(Struct.get('isCycleStart'), () => Array.of(option.circularLabel)),
										MMatch.orElse(() => Array.empty<PPString.Type>())
									)
								)
							)
					}),
					option.propertyFormatter.action(currentValue)
				)
		),
		Struct.get('value')
	);
