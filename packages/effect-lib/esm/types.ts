/** A simple type module */

import { Array, Function, Option, pipe, Predicate } from 'effect';

/* eslint-disable @typescript-eslint/no-explicit-any -- Unknown or never don't work as well as any when it comes to inference because any is both at the top and bottom of the tree type */

/**
 * Type that represents a non-null object as defined in javascript. It includes records (in their
 * usual computer science meaning), class instances, arrays, and functions but not null or
 * undefined.
 *
 * @category Models
 */
export interface NonPrimitive {
	readonly [key: string | symbol]: any;
}

/**
 * Type that represents an array
 *
 * @category Models
 */
export interface AnyArray extends Array<any> {}

/**
 * Type that represents a ReadonlyArray
 *
 * @category Models
 */
export interface AnyReadonlyArray extends ReadonlyArray<any> {}

/**
 * Type used to avoid warnings by eslint/functional when functions return a mutable array
 *
 * @category Models
 */
export interface MutableArray<T> extends Array<T> {}

/**
 * Type that represents an empty array or tuple
 *
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type EmptyArray = [];

/**
 * Type that represents an empty array or tuple
 *
 * @category Models
 */
export type EmptyReadonlyArray = readonly [];

/**
 * Type that represents a tuple or array with one element
 *
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Singleton<A> = [A];

/**
 * Type that represents a tuple or array with one element
 *
 * @category Models
 */
export type ReadonlySingleton<A> = readonly [A];

/**
 * Type that represents a tuple or array with two elements
 *
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Pair<A, B> = [A, B];

/**
 * Type that represents a tuple or array with two elements
 *
 * @category Models
 */
export type ReadonlyPair<A, B> = readonly [A, B];

/**
 * Type that represents a non empty array
 *
 * @category Models
 */

/* eslint-disable-next-line functional/prefer-readonly-type */
export type OverOne<A> = [A, ...Array<A>];

/**
 * Type that represents a non empty array
 *
 * @category Models
 */
export type ReadonlyOverOne<A> = readonly [A, ...ReadonlyArray<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type OverTwo<A> = [A, A, ...Array<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @category Models
 */
export type ReadonlyOverTwo<A> = readonly [A, A, ...ReadonlyArray<A>];

const _allTypedArrayConstructors = [
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array
] as const;
type _allTypedArrayConstructorsType = typeof _allTypedArrayConstructors;
type toTypedArrayInstances<A extends _allTypedArrayConstructorsType> = {
	readonly [key in keyof A]: InstanceType<A[key]>;
};
/**
 * Type that represents all typed arrays
 *
 * @category Models
 */
export type TypedArray = toTypedArrayInstances<_allTypedArrayConstructorsType>[number];

/**
 * Type that represents a function
 *
 * @category Models
 */
export interface AnyFunction {
	(...args: ReadonlyArray<any>): any;
}

/**
 * Type that represents a function with one argument
 *
 * @category Models
 */
export interface OneArgFunction<in A, out B = A> {
	(a: A): B;
}

/**
 * Type that represents a primitive except `null` and `undefined`
 *
 * @category Models
 */
export type NonNullablePrimitive = string | number | bigint | boolean | symbol;

/**
 * Type that represents a primitive
 *
 * @category Models
 */
export type Primitive = NonNullablePrimitive | null | undefined;

/**
 * Type that represents all possible Javascript values but not all possible Typescript types (it
 * does not represent Branded types for instance)
 *
 * @category Models
 */
export type Unknown = Primitive | NonPrimitive;

/**
 * Type that represents any predicate or refinement
 *
 * @category Models
 */
export type AnyPredicate = Predicate.Predicate<any>;

/**
 * Type that represents any refinement
 *
 * @category Models
 */
export type AnyRefinement = Predicate.Refinement<any, any>;

/**
 * Type that represents any refinement from a given type
 *
 * @category Models
 */
export type RefinementFrom<Source> = Predicate.Refinement<Source, any>;

/**
 * Type that represents a value that can be used as an error
 *
 * @category Models
 */
export type Errorish = { readonly message: string; readonly stack?: string | undefined };

/**
 * Type of a string transformer, i.e. a function that transforms a string into another one
 *
 * @category Models
 */
export interface StringTransformer extends OneArgFunction<string> {}

/**
 * Type that represents a function that transforms a string into a number.
 *
 * @category Models
 */
export interface NumberFromString extends OneArgFunction<string, number> {}

/**
 * Type that represents a function that transforms a number into a string.
 *
 * @category Models
 */
export interface NumberToString extends OneArgFunction<number, string> {}

/* eslint-disable-next-line functional/prefer-readonly-type */
type Enumerate<N extends number, Acc extends Array<number> = []> =
	/* eslint-disable-next-line functional/prefer-readonly-type */
	[Acc['length']] extends [N] ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Utility type that retuns `never` if two types are equal. `unknown` otherwise
 *
 * @category Utility types
 */
export type Equals<A, B> =
	readonly [A] extends readonly [B] ?
		readonly [B] extends readonly [A] ?
			never
		:	unknown
	:	unknown;

/**
 * Function that reports an error if the type it receives is not `never`
 *
 * @category Utils
 */
export function checkNever<_A extends never>(): void {}

/**
 * Utilityy type that generates a tuple of `N` `T`'s
 *
 * @category Utility types
 */
export type Tuple<T, N extends number> =
	N extends N ?
		number extends N ?
			ReadonlyArray<T>
		:	_TupleOf<T, N, readonly []>
	:	never;
type _TupleOf<T, N extends number, R extends ReadonlyArray<unknown>> =
	R['length'] extends N ? R : _TupleOf<T, N, readonly [T, ...R]>;

/**
 * Utility type that generates a range of numeric literal types
 *
 * @category Utility types
 */
export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

/**
 * Utility type that extracts all elements of a tuple but the first
 *
 * @category Utility types
 */
export type ReadonlyTail<T> =
	readonly [T] extends readonly [readonly [any, ...infer R]] ? { readonly [key in keyof R]: R[key] }
	:	never;

/**
 * Utility type that changes the types of all keys of a tuple, array, struct or record to Target
 *
 * @category Utility types
 */
export type MapToReadonlyTarget<Tuple, Target> = {
	readonly [k in keyof Tuple]: Target;
};

type BaseProtoKeys = symbol | 'toString' | 'toJSON' | 'pipe';

/**
 * Utility type that removes all non-data from a type.
 *
 * @category Utility types
 */
export type Data<T extends NonPrimitive, ProtoFunctions extends string | symbol = never> = {
	readonly [k in keyof T as readonly [k] extends readonly [BaseProtoKeys | ProtoFunctions] ? never
	:	k]: T[k];
};

/**
 * Utility type that removes all data from a type
 *
 * @category Utility types
 */
export type Proto<T extends NonPrimitive, ProtoFunctions extends string | symbol = never> = Omit<
	T,
	keyof Data<T, ProtoFunctions>
>;

/**
 * Constructs an object with prototype `proto` and data `data`
 *
 * @category Utils
 */
export const objectFromDataAndProto = <P extends NonPrimitive, D extends NonPrimitive>(
	proto: P,
	data: D
): P & D => Object.assign(Object.create(proto), data) as P & D;

/**
 * Utility type that changes the type of the unique parameter of `F` to `A` if `F` is a Refinement
 * or a OneArgFunction. Returns `F` otherwise
 *
 * @category Utility types
 */
export type SetArgTypeTo<F, A> =
	F extends Predicate.Refinement<infer _, infer R> ?
		R extends A ?
			Predicate.Refinement<A, R>
		:	F
	: F extends OneArgFunction<any, infer R> ? OneArgFunction<A, R>
	: F;

/**
 * Utility type that removes all private, symbolic and toString, toJSON keys from a type and makes
 * all remaining properties optional
 *
 * @category Utility types
 */
/*export type ToPredicates<R extends NonPrimitive> = {
	readonly [k in keyof Data<R>]: Predicate.Predicate<R[k]>;
};*/

/**
 * Utility type that creates an intersection of all keys of a type. Meant to be used with Tuples
 * even though not set as a constraint
 *
 * @category Utility types
 */
export type ToKeyIntersection<T> =
	{
		readonly [K in keyof T]: (x: T[K]) => void;
	} extends (
		{
			readonly [K: number]: (x: infer I) => void;
		}
	) ?
		I
	:	never;

/**
 * Utility type that creates an intersection and simplifies it which Typescript does not do by
 * itself (see
 * https://stackoverflow.com/questions/72395823/why-does-typescript-not-simplify-the-intersection-of-a-type-and-one-of-its-super)
 *
 * @category Utility types
 */

export type IntersectAndSimplify<T, U> =
	readonly [T] extends readonly [U] ? T
	: readonly [U] extends readonly [T] ? U
	: T & U;

/**
 * From `unknown` to `Array`. Not based on Array.isArray from a Typescript perspective because it is
 * bugged. See https://github.com/microsoft/TypeScript/issues/17002
 *
 * @category Guards
 */
export const isArray = <T>(arg: T): arg is ArrayType<T> => Array.isArray(arg);
type ArrayType<T> = Extract<
	true extends T & false ? AnyArray
	: T extends AnyReadonlyArray ? T
	: /* eslint-disable functional/prefer-readonly-type */ Array<unknown> /* eslint-enable functional/prefer-readonly-type */,
	T
>;

/**
 * From `unknown` to `string`
 *
 * @category Guards
 */
export const isString = (input: unknown): input is string => typeof input === 'string';

/**
 * From `unknown` to `number`
 *
 * @category Guards
 */
export const isNumber = (input: unknown): input is number => typeof input === 'number';

/**
 * From `unknown` to `bigint`
 *
 * @category Guards
 */
export const isBigInt = (input: unknown): input is bigint => typeof input === 'bigint';

/**
 * From `unknown` to `boolean`
 *
 * @category Guards
 */
export const isBoolean = (input: unknown): input is boolean => typeof input === 'boolean';

/**
 * From `unknown` to `symbol`
 *
 * @category Guards
 */
export const isSymbol = (input: unknown): input is symbol => typeof input === 'symbol';

/**
 * From `unknown` to `undefined`
 *
 * @category Guards
 */
export const isUndefined = (input: unknown): input is undefined => input === undefined;

/**
 * From a type `T` to the same type `T` without `undefined`
 *
 * @category Guards
 */
export const isNotUndefined = <A>(input: A): input is Exclude<A, undefined> => input !== undefined;

/**
 * From `unknown` to `null`
 *
 * @category Guards
 */
export const isNull = (input: unknown): input is null => input === null;

/**
 * From a type `T` to the same type `T` without `null`
 *
 * @category Guards
 */
export const isNotNull = <A>(input: A): input is Exclude<A, null> => input !== null;

/**
 * From a type `T` to `null` or `undefined` depending on what is in T
 *
 * @category Guards
 */
export const isNullable = <A>(input: A): input is Extract<A, null | undefined> =>
	input === null || input === undefined;

/**
 * From a type `T` to the same type `T` without `null` and `undefined`
 *
 * @category Guards
 */
export const isNotNullable = <A>(input: A): input is NonNullable<A> =>
	input !== null && input !== undefined;

/**
 * From `unknown` to `NonPrimitive`
 *
 * @category Guards
 */
export const isNonPrimitive = <A>(input: A): input is Exclude<A, Primitive> & NonPrimitive =>
	input !== null && (typeof input === 'object' || typeof input === 'function');

/**
 * From `unknown` to `Primitive`
 *
 * @category Guards
 */
export const isPrimitive = <A>(input: A): input is Exclude<A, NonPrimitive> & Primitive =>
	!isNonPrimitive(input);

/**
 * From `unknown` to `AnyFunction`
 *
 * @category Guards
 */
export const isFunction = (u: unknown): u is AnyFunction => typeof u === 'function';

/**
 * From a function with many arguments to a function with a single argument
 *
 * @category Guards
 */
export const isOneArgFunction = <A, R>(
	f: (a: A, ...args: ReadonlyArray<any>) => R
): f is (a: A) => R => f.length === 1;
/**
 * From `Array<A>` to `EmptyArray`
 *
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isEmptyArray = <A>(u: Array<A>): u is EmptyArray => u.length === 0;

/**
 * From `ReadonlyArray<A>` to `EmptyReadonlyArray`
 *
 * @category Guards
 */
export const isEmptyReadonlyArray = <A>(u: ReadonlyArray<A>): u is EmptyReadonlyArray =>
	u.length === 0;

/**
 * From `Array<A>` to `OverOne<A>`
 *
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isOverOne = <A>(u: Array<A>): u is OverOne<A> => u.length >= 1;

/**
 * From `ReadonlyArray<A>` to `ReadonlyOverOne<A>`
 *
 * @category Guards
 */
export const isReadonlyOverOne = <A>(u: ReadonlyArray<A>): u is ReadonlyOverOne<A> => u.length >= 1;

/**
 * From `Array<A>` to `OverTwo<A>`
 *
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isOverTwo = <A>(u: Array<A>): u is OverTwo<A> => u.length >= 2;

/**
 * From `ReadonlyArray<A>` to `ReadonlyOverTwo<A>`
 *
 * @category Guards
 */
export const isReadonlyOverTwo = <A>(u: ReadonlyArray<A>): u is ReadonlyOverTwo<A> => u.length >= 2;

/**
 * From `Array<A>` to `Singleton<A>`
 *
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isSingleton = <A>(u: Array<A>): u is Singleton<A> => u.length === 1;

/**
 * From `ReadonlyArray<A>` to `ReadonlySingleton<A>`
 *
 * @category Guards
 */
export const isReadonlySingleton = <A>(u: ReadonlyArray<A>): u is ReadonlySingleton<A> =>
	u.length === 1;

/**
 * From `Array<A>` to `Pair<A,A>`
 *
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isPair = <A>(u: Array<A>): u is Pair<A, A> => u.length === 2;

/**
 * From `ReadonlyArray<A>` to `ReadonlPair<A>`
 *
 * @category Guards
 */
export const isReadonlyPair = <A>(u: ReadonlyArray<A>): u is ReadonlyPair<A, A> => u.length === 2;

/**
 * From `unknown` to `Iterable<unknown>`. DOES NOT WORK FOR string which is the only primitive type
 * to be iterable
 *
 * @category Guards
 */
export const isIterable = (input: unknown): input is Iterable<unknown> =>
	Predicate.hasProperty(input, Symbol.iterator);

/**
 * From `unknown` to `Errorish`
 *
 * @category Guards
 */
export const isErrorish = (u: unknown): u is Errorish =>
	typeof u === 'object' &&
	u !== null &&
	'message' in u &&
	typeof u.message === 'string' &&
	(!('stack' in u) || typeof u.stack === 'string');

/**
 * If `u` is a TypedArray, returns a `some` of its name (e.g. UInt8Array). Otherwise, returns a
 * `none`
 *
 * @category Information
 */
export const typedArrayName = (u: unknown): Option.Option<string> =>
	pipe(
		_allTypedArrayConstructors,
		Array.findFirst((constructor) => u instanceof constructor),
		Option.map(
			(constructor) =>
				(constructor as unknown as { readonly [Symbol.species]: { readonly name: string } })[
					Symbol.species
				].name
		)
	);

/**
 * From `unknown` to `TypedArray`
 *
 * @category Guards
 */
export const isTypedArray = <A>(input: A): input is Extract<A, TypedArray> =>
	pipe(input, typedArrayName, Option.isSome);

/**
 * Possible categories of a Javascript value
 *
 * @category Models
 */
export enum Category {
	String = 0,
	Number = 1,
	Bigint = 2,
	Boolean = 3,
	Symbol = 4,
	Null = 5,
	Undefined = 6,
	// Record is to be understood in its computer science usual meaning, so a list of values identified by a key. Not to be confused with a Typescript Record that also includes arrays and functions.
	Record = 7,
	Array = 8,
	Function = 9
}

/**
 * Namespace for the possible categories of a Javascript value
 *
 * @category Models
 */
export namespace Category {
	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const fromValue = (u: unknown): Category => {
		switch (typeof u) {
			case 'string':
				return Category.String;
			case 'number':
				return Category.Number;
			case 'bigint':
				return Category.Bigint;
			case 'boolean':
				return Category.Boolean;
			case 'symbol':
				return Category.Symbol;
			case 'undefined':
				return Category.Undefined;
			case 'function':
				return Category.Function;
			case 'object':
				return (
					u === null ? Category.Null
					: Array.isArray(u) ? Category.Array
					: Category.Record
				);
			default:
				return Function.absurd(u as never);
		}
	};

	/**
	 * Returns `true` if `self` represents a non-primitive. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isNonPrimitive: Predicate.Predicate<Category> = (self) =>
		self === Category.Record || self === Category.Array || self === Category.Function;

	/**
	 * Returns `true` if `self` represents a primitive. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isPrimitive: Predicate.Predicate<Category> = Predicate.not(isNonPrimitive);

	/**
	 * Returns `true` if `self` represents a string. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isString: Predicate.Predicate<Category> = (self) => self === Category.String;

	/**
	 * Returns `true` if `self` represents a number. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isNumber: Predicate.Predicate<Category> = (self) => self === Category.Number;

	/**
	 * Returns `true` if `self` represents a bigint. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isBigint: Predicate.Predicate<Category> = (self) => self === Category.Bigint;

	/**
	 * Returns `true` if `self` represents a boolean. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isBoolean: Predicate.Predicate<Category> = (self) => self === Category.Boolean;

	/**
	 * Returns `true` if `self` represents a symbol. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isSymbol: Predicate.Predicate<Category> = (self) => self === Category.Symbol;

	/**
	 * Returns `true` if `self` is undefined. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isUndefined: Predicate.Predicate<Category> = (self) => self === Category.Undefined;

	/**
	 * Returns `true` if `self` is null. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isNull: Predicate.Predicate<Category> = (self) => self === Category.Null;

	/**
	 * Returns `true` if `self` represents a function. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isFunction: Predicate.Predicate<Category> = (self) => self === Category.Function;

	/**
	 * Returns `true` if `self` represents an array. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isArray: Predicate.Predicate<Category> = (self) => self === Category.Array;

	/**
	 * Returns `true` if `self` represents a record. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isRecord: Predicate.Predicate<Category> = (self) => self === Category.Record;
}

/**
 * A value with a covariant type
 *
 * @category Constants
 */
export const covariantValue = (_: never) => _;

/**
 * A value with a contravariant type
 *
 * @category Constants
 */
export const contravariantValue = (_: unknown) => _;

/**
 * A value with an invariant type
 *
 * @category Constants
 */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const invariantValue = (_: any) => _;
