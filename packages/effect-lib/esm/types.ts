/** A simple type module */

import { Function, Predicate } from 'effect';

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
 * does not represent for instance types like the intersection of a primitive and an object)
 *
 * @category Models
 */
export type Unknown = Primitive | NonPrimitive;

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
export interface StringTransformer extends OneArgFunction<string, string> {}

/* eslint-disable-next-line functional/prefer-readonly-type */
type Enumerate<N extends number, Acc extends Array<number> = []> =
	/* eslint-disable-next-line functional/prefer-readonly-type */
	[Acc['length']] extends [N] ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

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
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Tail<T extends AnyArray> = [T] extends [[any, ...infer R]] ? R : never;

/**
 * Utility type that alters all types of a tuple Tuple to Target
 *
 * @category Utility types
 */
export type ToTupleOf<Tuple extends AnyArray, Target> = {
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
 * Utility type that returns all the keys of a record whose value is a function except those which
 * are in the BaseProtoKeys list.
 */
/*export type NonSymbolicFunctionKeys<T extends NonPrimitive> = keyof {
	readonly [k in keyof T as readonly [k] extends readonly [BaseProtoKeys] ? never
	: readonly [T[k]] extends readonly [AnyFunction] ? k
	: never]: void;
};*/

/**
 * Utility type that transforms a functions with several arguments into a function with one argument
 *
 * @category Utility types
 */
export type toOneArgFunction<F extends AnyFunction> =
	F extends () => any ? never : (arg1: Parameters<F>[0]) => ReturnType<F>;

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
 * Utility type that changes the type of the unique parameter of a OneArgFunction to `A` when
 * possible
 *
 * @category Utility types
 */
export type WithArgType<F, A> =
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
 * Utility type that creates an intersection of all types in a tuple/record
 *
 * @category Utility types
 */
export type TupleToIntersection<T extends NonPrimitive> =
	{
		readonly [K in keyof T]: (x: T[K]) => void;
	} extends (
		{
			readonly [K: number]: (x: infer I) => void;
		}
	) ?
		I
	:	never;

type ArrayType<T> = Extract<
	true extends T & false ? AnyArray
	: T extends AnyReadonlyArray ? T
	: /* eslint-disable functional/prefer-readonly-type */ Array<unknown> /* eslint-enable functional/prefer-readonly-type */,
	T
>;

/**
 * Utility type that creates an intersection and simplifies it which Typescript does not do by
 * itself (see
 * https://stackoverflow.com/questions/72395823/why-does-typescript-not-simplify-the-intersection-of-a-type-and-one-of-its-super)
 *
 * @category Utility types
 */

export type SimplifiedIntersect<T, U> =
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
 * From `unknown` to `AnyFunction`
 *
 * @category Guards
 */
export const isFunction = (u: unknown): u is AnyFunction => typeof u === 'function';

/**
 * From `unknown` to `NonPrimitive`
 *
 * @category Guards
 */
export const isNonPrimitive = (u: unknown): u is NonPrimitive =>
	u !== null && ['object', 'function'].includes(typeof u);

/**
 * From `unknown` to `Primitive`
 *
 * @category Guards
 */
export const isPrimitive = (u: unknown): u is Primitive =>
	u === null || !['object', 'function'].includes(typeof u);

/**
 * From `unknown` to `Iterable<unknown>`
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
	u !== null &&
	typeof u === 'object' &&
	'message' in u &&
	typeof u.message === 'string' &&
	(!('stack' in u) || typeof u.stack === 'string');

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
 * From `F` to `toOneArgFunction<F>`
 *
 * @category Guards
 */
export const isOneArgFunction = <F extends AnyFunction>(
	f: F | toOneArgFunction<F>
): f is toOneArgFunction<F> => f.length === 1;

/**
 * Namespace for the possible categories of a Javascript value
 *
 * @category Models
 */
export namespace Category {
	/**
	 * Type of a Category.
	 *
	 * @category Models
	 */
	export enum Type {
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
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const fromValue = (u: unknown): Type => {
		switch (typeof u) {
			case 'string':
				return Type.String;
			case 'number':
				return Type.Number;
			case 'bigint':
				return Type.Bigint;
			case 'boolean':
				return Type.Boolean;
			case 'symbol':
				return Type.Symbol;
			case 'undefined':
				return Type.Undefined;
			case 'function':
				return Type.Function;
			case 'object':
				return (
					u === null ? Type.Null
					: Array.isArray(u) ? Type.Array
					: Type.Record
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
	export const isNonPrimitive: Predicate.Predicate<Type> = (self) =>
		[Type.Record, Type.Array, Type.Function].includes(self);

	/**
	 * Returns `true` if `self` represents a primitive. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isPrimitive: Predicate.Predicate<Type> = Predicate.not(isNonPrimitive);

	/**
	 * Returns `true` if `self` represents a string. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isString: Predicate.Predicate<Type> = (self) => self === Type.String;

	/**
	 * Returns `true` if `self` represents a number. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isNumber: Predicate.Predicate<Type> = (self) => self === Type.Number;

	/**
	 * Returns `true` if `self` represents a bigint. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isBigint: Predicate.Predicate<Type> = (self) => self === Type.Bigint;

	/**
	 * Returns `true` if `self` represents a boolean. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isBoolean: Predicate.Predicate<Type> = (self) => self === Type.Boolean;

	/**
	 * Returns `true` if `self` represents a symbol. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isSymbol: Predicate.Predicate<Type> = (self) => self === Type.Symbol;

	/**
	 * Returns `true` if `self` is undefined. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isUndefined: Predicate.Predicate<Type> = (self) => self === Type.Undefined;

	/**
	 * Returns `true` if `self` is null. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isNull: Predicate.Predicate<Type> = (self) => self === Type.Null;

	/**
	 * Returns `true` if `self` represents a function. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isFunction: Predicate.Predicate<Type> = (self) => self === Type.Function;

	/**
	 * Returns `true` if `self` represents an array. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isArray: Predicate.Predicate<Type> = (self) => self === Type.Array;

	/**
	 * Returns `true` if `self` represents a record. `false` otherwise
	 *
	 * @category Predicates
	 */
	export const isRecord: Predicate.Predicate<Type> = (self) => self === Type.Record;
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
