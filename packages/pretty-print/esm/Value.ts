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
	MArray,
	MFunction,
	MInspectable,
	MPipeable,
	MPredicate,
	MString,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Boolean,
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

export const moduleTag = '@parischap/pretty-print/Value/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const _TagSymbol: unique symbol = Symbol.for(moduleTag + '_TagSymbol/');

/**
 * Type of a Value
 *
 * @category Models
 */
export type Type<V extends MTypes.Unknown> = Top.Type<V> | Property.Type<V>;

/**
 * Type that represents any Value in its stringification context
 *
 * @category Models
 */
export type All = Top.All | Property.All;

/**
 * Type that represents a primitive in its stringification context
 *
 * @category Models
 */
export type PrimitiveType = Top.PrimitiveType | Property.PrimitiveType;

/**
 * Type that represents an array in its stringification context
 *
 * @category Models
 */
export type ArrayType = Top.ArrayType | Property.ArrayType;

/**
 * Type that represents a function in its stringification context
 *
 * @category Models
 */
export type FunctionType = Top.FunctionType | Property.FunctionType;

/**
 * Type that represents a non primitive value in its stringification context
 *
 * @category Models
 */
export type NonPrimitiveType = Top.NonPrimitiveType | Property.NonPrimitiveType;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is All => Predicate.hasProperty(u, TypeId);
const _has = has;

/**
 * Type guard
 *
 * @category Guards
 */
export const isTop = (u: All): u is Top.All => u[_TagSymbol] === 'Top';

/**
 * Type guard
 *
 * @category Guards
 */
export const isProperty = (u: All): u is Property.All => u[_TagSymbol] === 'Property';

/**
 * True if the `value` of `self` represents a primitive
 *
 * @category Guards
 */
export const isPrimitive = (self: All): self is PrimitiveType =>
	pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Primitive));

/**
 * True if the `value` of `self` represents an array
 *
 * @category Guards
 */
export const isArray = (self: All): self is ArrayType =>
	pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Array));

/**
 * True if the `value` of `self` is a Function
 *
 * @category Guards
 */
export const isFunction = (self: All): self is FunctionType =>
	pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function));

/**
 * True if the `value` of `self` represents a non primitive value
 *
 * @category Guards
 */
export const isNonPrimitive = (self: All): self is NonPrimitiveType =>
	pipe(self, isPrimitive, Boolean.not);

/**
 * Namespace for a Top value
 *
 * @category Models
 */
export namespace Top {
	/**
	 * Top value type
	 *
	 * @category Models
	 */
	export interface Type<out V extends MTypes.Unknown>
		extends Inspectable.Inspectable,
			Pipeable.Pipeable {
		/** The value */
		readonly value: V;

		/** The category of `value` */
		readonly valueCategory: MTypes.Category.Type;

		/**
		 * Depth of `value` in the value to stringify: number of nested non-primitive values to open to
		 * reach `value`.
		 */
		readonly depth: 0;

		/** @internal */
		readonly [_TagSymbol]: 'Top';

		/** @internal */
		readonly [TypeId]: {
			readonly _V: Types.Covariant<V>;
		};
	}

	/**
	 * Type that represents any Top value in its stringification context
	 *
	 * @category Models
	 */
	export interface All extends Type<MTypes.Unknown> {}

	/**
	 * Type that represents a primitive in its stringification context
	 *
	 * @category Models
	 */
	export type PrimitiveType = Type<MTypes.Primitive>;

	/**
	 * Type that represents an array in its stringification context
	 *
	 * @category Models
	 */
	export type ArrayType = Type<MTypes.AnyArray>;

	/**
	 * Type that represents a function in its stringification context
	 *
	 * @category Models
	 */
	export type FunctionType = Type<MTypes.AnyFunction>;

	/**
	 * Type that represents a non primitive Top value in its stringification context
	 *
	 * @category Models
	 */
	export type NonPrimitiveType = Type<MTypes.NonPrimitive>;

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is All => _has(u) && isTop(u);

	/** Proto */
	const proto: MTypes.Proto<Type<never>> = {
		[TypeId]: {
			_V: MTypes.covariantValue
		},
		[_TagSymbol]: 'Top',
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = <V extends MTypes.Unknown>(params: MTypes.Data<Type<V>>): Type<V> =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <V extends MTypes.Unknown>(value: V): Type<V> =>
		_make({ value, valueCategory: MTypes.Category.fromValue(value), depth: 0 });

	/**
	 * True if the `value` of `self` represents a primitive
	 *
	 * @category Guards
	 */
	export const isPrimitive = (self: All): self is PrimitiveType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Primitive));

	/**
	 * True if the `value` of `self` represents an array
	 *
	 * @category Guards
	 */
	export const isArray = (self: All): self is ArrayType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Array));

	/**
	 * True if the `value` of `self` is a Function
	 *
	 * @category Guards
	 */
	export const isFunction = (self: All): self is FunctionType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function));

	/**
	 * True if the `value` of `self` represents a non primitive value
	 *
	 * @category Guards
	 */
	export const isNonPrimitive = (self: All): self is NonPrimitiveType =>
		pipe(self, isPrimitive, Boolean.not);
}

/**
 * Namespace for a Property value
 *
 * @category Models
 */
export namespace Property {
	/**
	 * An interface that represents a Property value
	 *
	 * @category Models
	 */
	export interface Type<out V extends MTypes.Unknown>
		extends Inspectable.Inspectable,
			Pipeable.Pipeable {
		/** The value */
		readonly value: V;
		/** The category of `value` */
		readonly valueCategory: MTypes.Category.Type;

		/**
		 * Depth of `value` in the value to stringify: number of nested non-primitive values to open to
		 * reach `value`.
		 */
		readonly depth: number;

		/** Depth of `value` in the prototypal chain of the current non-primitive value */
		readonly protoDepth: number;

		/**
		 * The stringified representation of the key to which `value` is attached. One string for each
		 * line of the key. The key can be on several lines for object like maps
		 */
		readonly stringKey: MTypes.OverOne<string>;

		/** Same as stringKey, but all lines are joined with an empty string */
		readonly oneLineStringKey: string;

		/** `true` if `key` is a symbol. `false` otherwise. */
		readonly hasSymbolicKey: boolean;

		/** 'true' if ths property is enumerable key. 'false' otherwise. */
		readonly isEnumerable: boolean;

		/** @internal */
		readonly [_TagSymbol]: 'Property';

		/** @internal */
		readonly [TypeId]: {
			readonly _V: Types.Covariant<V>;
		};
	}

	/**
	 * Type that represents any Top value in its stringification context
	 *
	 * @category Models
	 */
	export interface All extends Type<MTypes.Unknown> {}

	/**
	 * Type that represents a primitive in its stringification context
	 *
	 * @category Models
	 */
	export type PrimitiveType = Type<MTypes.Primitive>;

	/**
	 * Type that represents an array in its stringification context
	 *
	 * @category Models
	 */
	export type ArrayType = Type<MTypes.AnyArray>;

	/**
	 * Type that represents a function in its stringification context
	 *
	 * @category Models
	 */
	export type FunctionType = Type<MTypes.AnyFunction>;

	/**
	 * Type that represents a non primitive Property value in its stringification context
	 *
	 * @category Models
	 */
	export type NonPrimitiveType = Type<MTypes.NonPrimitive>;

	/**
	 * Type guard
	 *
	 * @category Guards
	 */

	export const has = (u: unknown): u is All => _has(u) && isProperty(u);

	/** Proto */
	const proto: MTypes.Proto<Type<never>> = {
		[TypeId]: {
			_V: MTypes.covariantValue
		},
		[_TagSymbol]: 'Property',
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = <V extends MTypes.Unknown>(params: MTypes.Data<Type<V>>): Type<V> =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const fromNonPrimitive = ({
		nonPrimitiveValue,
		key,
		depth,
		protoDepth
	}: {
		readonly nonPrimitiveValue: MTypes.NonPrimitive;
		readonly key: string | symbol;
		readonly depth: number;
		readonly protoDepth: number;
	}): All => {
		const value = nonPrimitiveValue[key] as MTypes.Unknown;
		const oneLineStringKey = MString.fromNonNullablePrimitive(key);
		return _make({
			value,
			valueCategory: MTypes.Category.fromValue(value),
			depth,
			protoDepth,
			stringKey: Array.of(oneLineStringKey),
			oneLineStringKey,
			hasSymbolicKey: MTypes.isSymbol(key),
			isEnumerable: Object.prototype.propertyIsEnumerable.call(nonPrimitiveValue, key)
		});
	};

	/**
	 * Returns the `protoDepth` property of `self`
	 *
	 * @category Destructors
	 */
	export const protoDepth: MTypes.OneArgFunction<All, number> = Struct.get('protoDepth');

	/**
	 * Returns the `stringKey` property of `self`
	 *
	 * @category Destructors
	 */
	export const stringKey: MTypes.OneArgFunction<All, MTypes.OverOne<string>> = Struct.get(
		'stringKey'
	);

	/**
	 * Returns the `oneLineStringKey` property of `self`
	 *
	 * @category Destructors
	 */
	export const oneLineStringKey: MTypes.OneArgFunction<All, string> =
		Struct.get('oneLineStringKey');

	/**
	 * Returns the `hasSymbolicKey` property of `self`
	 *
	 * @category Destructors
	 */
	export const hasSymbolicKey: MTypes.OneArgFunction<All, boolean> = Struct.get('hasSymbolicKey');

	/**
	 * Returns the `isEnumerable` property of `self`
	 *
	 * @category Destructors
	 */
	export const isEnumerable: MTypes.OneArgFunction<All, boolean> = Struct.get('isEnumerable');

	/**
	 * True if the `value` of `self` represents a primitive
	 *
	 * @category Guards
	 */
	export const isPrimitive = (self: All): self is PrimitiveType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Primitive));

	/**
	 * True if the `value` of `self` represents an array
	 *
	 * @category Guards
	 */
	export const isArray = (self: All): self is ArrayType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Array));

	/**
	 * True if the `value` of `self` is a Function
	 *
	 * @category Guards
	 */
	export const isFunction = (self: All): self is FunctionType =>
		pipe(self.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function));

	/**
	 * True if the `value` of `self` represents a non primitive value
	 *
	 * @category Guards
	 */
	export const isNonPrimitive = (self: All): self is NonPrimitiveType =>
		pipe(self, isPrimitive, Boolean.not);
}

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
 * Namespace of an array of Property's
 *
 * @category Models
 */
export namespace Properties {
	/**
	 * Type that represents the properties of a record
	 *
	 * @category Models
	 */
	export interface Type extends ReadonlyArray<Property.All> {}

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const fromNonPrimitiveTop =
		(maxPrototypeDepth: number) =>
		(nonPrimitive: Top.NonPrimitiveType): Type => {
			const depth = nonPrimitive.depth + 1;
			return pipe(
				{ protoDepth: 0, nonPrimitiveValue: nonPrimitive.value },
				MArray.unfoldNonEmpty(
					MTuple.makeBothBy({
						toFirst: ({ protoDepth, nonPrimitiveValue }) =>
							pipe(
								nonPrimitiveValue,
								// Record.map will not return all keys
								Reflect.ownKeys,
								Array.map((key) =>
									Property.fromNonPrimitive({
										nonPrimitiveValue,
										key,
										depth,
										protoDepth
									})
								)
							),
						toSecond: flow(
							MStruct.evolve({
								protoDepth: Number.increment,
								nonPrimitiveValue: Reflect.getPrototypeOf
							}),
							Option.liftPredicate(
								MPredicate.struct({
									protoDepth: Number.lessThanOrEqualTo(maxPrototypeDepth),
									nonPrimitiveValue: MTypes.isNonPrimitive
								})
							)
						)
					})
				),
				Array.flatten,
				// Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
				Array.filter(
					MPredicate.struct({ stringKey: Predicate.not(MFunction.strictEquals('__proto__')) })
				)
			);
		};
}
