/**
 * Type that represents a value in its stringification context. A Value instance is created for the
 * value to stringify and, if that value is a record, for each property and nested property of that
 * record.
 *
 * Value's can be ordered by ValueOrder instances (see ValueOrder.ts)
 *
 * As an end user, you should never have to create a Value instance.
 */
import {
	MFunction,
	MInspectable,
	MPipeable,
	MString,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Boolean,
	Equal,
	Equivalence,
	Hash,
	Inspectable,
	Number,
	Pipeable,
	Predicate,
	String,
	Struct,
	Types,
	flow,
	pipe
} from 'effect';

export const moduleTag = '@parischap/pretty-print/Value/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * An interface that represents a Value
 *
 * @category Models
 */
export interface Type<out V extends MTypes.Unknown>
	extends Equal.Equal,
		Inspectable.Inspectable,
		Pipeable.Pipeable {
	/** The value to stringify */
	readonly value: V;
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

	/** @internal */
	readonly [TypeId]: {
		readonly _V: Types.Covariant<V>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<MTypes.Unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Returns an equivalence based on an equivalence of the value property
 *
 * @category Equivalences
 */
export const getEquivalence = <V extends MTypes.Unknown>(
	valueEquivalence: Equivalence.Equivalence<V>
): Equivalence.Equivalence<Type<V>> =>
	Equivalence.make((self, that) => valueEquivalence(self.value, that.value));

/**
 * Equivalence based on the equality of their values for cycle detection
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<All> = getEquivalence(
	(self, that) => self === that
);

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
 * Creates a `Value` from `value` which is the value to stringify
 *
 * @category Constructors
 */
export const makeFromTopValue = (value: unknown): All =>
	_make({
		value: value as MTypes.Unknown,
		valueCategory: MTypes.Category.fromValue(value),
		depth: 0,
		protoDepth: 0,
		key: '',
		stringKey: '',
		hasSymbolicKey: false,
		hasEnumerableKey: false,
		belongsToArray: false
	});

/**
 * Type that represents any Value in its stringification context
 *
 * @category Models
 */
export interface All extends Type<MTypes.Unknown> {}

/**
 * Type that represents a primitive in its stringification context
 *
 * @category Models
 */
export interface PrimitiveType extends Type<MTypes.Primitive> {}

/**
 * Type that represents an array in its stringification context
 *
 * @category Models
 */
export interface ArrayType extends Type<MTypes.AnyArray> {}

/**
 * Type that represents a record in its stringification context
 *
 * @category Models
 */
export interface RecordType extends Type<MTypes.NonNullObject> {}

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: <V extends MTypes.Unknown>(self: Type<V>) => V = Struct.get('value');

/**
 * Returns the `valueCategory` property of `self`
 *
 * @category Destructors
 */
export const valueCategory: MTypes.OneArgFunction<All, MTypes.Category.Type> =
	Struct.get('valueCategory');

/**
 * Returns the `depth` property of `self`
 *
 * @category Destructors
 */
export const depth: MTypes.OneArgFunction<All, number> = Struct.get('depth');

/**
 * Returns the `protoDepth` property of `self`
 *
 * @category Destructors
 */
export const protoDepth: MTypes.OneArgFunction<All, number> = Struct.get('protoDepth');

/**
 * Returns the `key` property of `self`
 *
 * @category Destructors
 */
export const key: MTypes.OneArgFunction<All, string | symbol> = Struct.get('key');

/**
 * Returns the `stringKey` property of `self`
 *
 * @category Destructors
 */
export const stringKey: MTypes.OneArgFunction<All, string> = Struct.get('stringKey');

/**
 * Returns the `hasSymbolicKey` property of `self`
 *
 * @category Destructors
 */
export const hasSymbolicKey: MTypes.OneArgFunction<All, boolean> = Struct.get('hasSymbolicKey');

/**
 * Returns the `hasEnumerableKey` property of `self`
 *
 * @category Destructors
 */
export const hasEnumerableKey: MTypes.OneArgFunction<All, boolean> = Struct.get('hasEnumerableKey');

/**
 * Returns the `belongsToArray` property of `self`
 *
 * @category Destructors
 */
export const belongsToArray: MTypes.OneArgFunction<All, boolean> = Struct.get('belongsToArray');

/**
 * True if the `value` of `self` represents a primitive
 *
 * @category Guards
 */
export const isPrimitive = (self: All): self is PrimitiveType =>
	pipe(self, valueCategory, MFunction.strictEquals(MTypes.Category.Type.Primitive));

/**
 * True if the `value` of `self` represents an array
 *
 * @category Guards
 */
export const isArray = (self: All): self is ArrayType =>
	pipe(self, valueCategory, MFunction.strictEquals(MTypes.Category.Type.Array));

/**
 * True if the `value` of `self` represents a record
 *
 * @category Guards
 */
export const isRecord = (self: All): self is RecordType => pipe(self, isPrimitive, Boolean.not);

/**
 * True if the `value` of `self` is not null
 *
 * @category Guards
 */
export const isNotNull = <V extends MTypes.Unknown>(
	self: Type<V>
): self is Type<Exclude<V, null>> => pipe(self, value, Predicate.isNotNull);

/**
 * True if the `value` of `self` is a Function
 *
 * @category Guards
 */
export const isFunction = (self: All): self is Type<MTypes.AnyFunction> =>
	pipe(self, valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function));

/**
 * True if the `value` of `self` belongs to a record
 *
 * @category Predicates
 */
export const belongsToRecord: Predicate.Predicate<All> = flow(stringKey, String.isNonEmpty);

/**
 * Returns a copy of `self` with `protoDepth` set to 0
 *
 * @category Utils
 */
export const resetProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.set({ protoDepth: 0 }),
	_make
);

/**
 * Returns a copy of `self` with `depth` incremented by 1
 *
 * @category Utils
 */
export const incDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.evolve({ depth: Number.increment }),
	_make
);

/**
 * Returns a copy of `self` with `protoDepth` incremented by 1
 *
 * @category Utils
 */
export const incProtoDepth: <V extends MTypes.Unknown>(self: Type<V>) => Type<V> = flow(
	MStruct.evolve({ protoDepth: Number.increment }),
	_make
);

/**
 * Returns a copy of `self` with `value` replaced by its prototype. Replacing the value by its
 * prototype does not change any characteristic of the value, so we don't need to update
 * valueCategory, key, stringKey,... The prototype can be seen as an extension of the value that
 * contains extra properties.
 *
 * @category Utils
 */
export const toProto = (self: RecordType): Type<MTypes.NonNullObject | null> =>
	pipe(self, MStruct.evolve({ value: Reflect.getPrototypeOf }), _make);

/**
 * Builds a new Value from a property of an existing RecordType `self` specified by `key`. Only
 * `depth` and `protoDepth` are left unchanged.
 *
 * @category Utils
 */
export const toRecordPropertyBuilder = (self: RecordType): ((key: string | symbol) => All) => {
	const underlying = self.value;
	const belongsToArray = MTypes.isArray(underlying);
	return (key) => {
		const value = underlying[key] as MTypes.Unknown;
		return pipe(
			self as All,
			MStruct.set({
				value,
				valueCategory: MTypes.Category.fromValue(value),
				key,
				stringKey: MString.fromNonNullablePrimitive(key),
				hasSymbolicKey: MTypes.isSymbol(key),
				hasEnumerableKey: Object.prototype.propertyIsEnumerable.call(underlying, key),
				belongsToArray
			}),
			_make
		);
	};
};

/** @category Destructors */
const toFormattedKey;
