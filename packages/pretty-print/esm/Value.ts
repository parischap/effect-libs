/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * Type that represents a value in its stringification context. A Value instance is created for the
 * value to stringify and, if that value is a record, for each property and nested property of that
 * record.
 *
 * Value's can be ordered by ValueOrder instances (see ValueOrder.ts)
 *
 * As an end user, you should never have to create a Value instance.
 *
 * @since 0.0.1
 */
import { MInspectable, MPipeable, MString, MStruct, MTypes } from '@parischap/effect-lib';
import {
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
import type * as StringifiedValue from './StringifiedValue.js';

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
	/** Contains the result of calling Options.byPasser on `value` */
	readonly byPassedValue: Option.Option<StringifiedValue.Type>;

	/**
	 * Depth of `value` in the value to stringify: number of nested arrays and objects to open to
	 * reach `value`.
	 */
	readonly depth: number;

	/**
	 * Depth of `value` in the prototypal chain of the value to stringify: number of prototypes to
	 * open to reach `value`
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
	/** `true` if `value` belongs to a record and represents a function. `false` otherwise. */
	readonly hasFunctionValue: boolean;
	/** `true` if `value` belongs to a record and is attached to a symbolic key. `false` otherwise. */
	readonly hasSymbolicKey: boolean;
	/** 'true' if `value` belongs to a record and is attached to an enumerable key. 'false' otherwise. */
	readonly hasEnumerableKey: boolean;
	/** 'true' if `value` belongs to a record that is an array */
	readonly belongsToArray: boolean;

	/** `true` if this value is the start of a cycle */
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
 * Equivalence for the value property
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const getEquivalence = <V extends MTypes.Unknown>(
	isEquivalent: Equivalence.Equivalence<V>
): Equivalence.Equivalence<Type<V>> =>
	Equivalence.make((self, that) => isEquivalent(self.value, that.value));

/**
 * Equivalence based on the equality of their values
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence = getEquivalence(Equal.equals);

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_V: MTypes.covariantValue
	},
	[Equal.symbol]<V extends MTypes.Unknown>(this: Type<V>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
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
 * Empty instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: All = _make({
	value: null as MTypes.Unknown,
	depth: 0,
	protoDepth: 0,
	key: '',
	stringKey: '',
	hasFunctionValue: false,
	hasSymbolicKey: false,
	hasEnumerableKey: false,
	byPassedValue: Option.none(),
	isCycleStart: false,
	belongsToArray: false
});

/**
 * True if the `value` of `self` represents a record
 *
 * @since 0.0.1
 * @category Guards
 */
export const isRecord: Predicate.Refinement<All, RecordType> = Predicate.struct({
	value: MTypes.isRecord
}) as never;

/**
 * True if the `value` of `self` represents an array
 *
 * @since 0.0.1
 * @category Guards
 */
export const isArray: Predicate.Refinement<All, ArrayType> = Predicate.struct({
	value: MTypes.isArray
}) as never;

/**
 * True if the `value` of `self` represents a function
 *
 * @since 0.0.1
 * @category Guards
 */
export const isFunction: Predicate.Refinement<All, FunctionType> = Predicate.struct({
	value: MTypes.isFunction
}) as never;

/**
 * True if the `value` of `self` represents a primitive
 *
 * @since 0.0.1
 * @category Guards
 */
export const isPrimitive: Predicate.Refinement<All, PrimitiveType> = Predicate.struct({
	value: MTypes.isPrimitive
}) as never;

/**
 * Returns a copy of `self` with `value` and `byPassedValue` set to `value` and `byPassedValue`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const setValue = (
	value: MTypes.Unknown,
	byPassedValue: Option.Option<StringifiedValue.Type>
): ((self: All) => All) =>
	flow(
		Struct.evolve({
			value: Function.constant(value),
			byPassedValue: Function.constant(byPassedValue)
		}),
		_make
	);

/**
 * Returns a copy of `self` with `value` and `byPassedValue` set to `value` and `byPassedValue`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const setAsRecordKey = (
	key: string | symbol,
	parentRecord: MTypes.AnyRecord
): ((self: All) => All) =>
	flow(
		Struct.evolve({
			key: Function.constant(key),
			stringKey: pipe(key, MString.fromNonNullablePrimitive, Function.constant),
			hasSymbolicKey: pipe(key, MTypes.isSymbol, Function.constant),
			hasEnumerableKey: Function.constant(
				Object.prototype.propertyIsEnumerable.call(parentRecord, key)
			),
			belongsToArray: pipe(parentRecord, MTypes.isArray, Function.constant)
		}),
		MStruct.enrichWith({ hasFunctionValue: flow(Struct.get('value'), MTypes.isFunction) }),
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
	flow(Struct.evolve({ isCycleStart: Function.constant(isCycleStart) }), _make);

/**
 * Returns a copy of `self` with `protoDepth` set to 0
 *
 * @since 0.0.1
 * @category Utils
 */
export const resetProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	Struct.evolve({ protoDepth: Function.constant(0) }),
	_make
);

/**
 * Returns a copy of `self` with `depth` incremented by 1
 *
 * @since 0.0.1
 * @category Utils
 */
export const incDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	Struct.evolve({ depth: Number.increment }),
	_make
);

/**
 * Returns a copy of `self` with `protoDepth` incremented by 1
 *
 * @since 0.0.1
 * @category Utils
 */
export const incProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	Struct.evolve({ protoDepth: Number.increment }),
	_make
);

/**
 * Returns a `some` of a copy of `self` with `value` replaced by its prototype if it's not null.
 * Otherwise, returns a `none`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const toProto = <V extends MTypes.AnyRecord>(self: Type<V>): Option.Option<Type<V>> =>
	pipe(
		self,
		Struct.evolve({ value: Reflect.getPrototypeOf }),
		Option.liftPredicate(
			Predicate.struct({ value: Predicate.isNotNull }) as unknown as Predicate.Refinement<
				object | null,
				Type<V>
			>
		),
		Option.map(_make)
	);

/**
 * Returns a copy of `self` for each of its properties
 *
 * @since 0.0.1
 * @category Utils
 */
export const toProperties: (self: RecordType) => ArrayType<V> = flow(
	Struct.evolve({ protoDepth: Number.increment }),
	_make
);
