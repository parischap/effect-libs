/**
 * A simple type module
 *
 * @since 0.0.6
 */

import { Array, Predicate } from 'effect';

/* eslint-disable @typescript-eslint/no-explicit-any -- Unknown or never don't work as well as any when it comes to inference because any is both at the top and bottom of the tree type */

/**
 * Type that represents a record. From a typescript perspective, this covers arrays, objects, class
 * instances and functions but not not null and undefined
 *
 * @since 0.0.6
 * @category Models
 */
export interface AnyRecord {
	readonly [key: string | symbol]: any;
}

/**
 * Type created to avoid eslint-plugin-functional errors that expect ReadonlyArrays in function
 * returns
 *
 * @since 0.0.6
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type ReturnArray<out T> = Array<T>;

/**
 * Type that represents an array
 *
 * @since 0.0.6
 * @category Models
 */
export type AnyArray = ReturnArray<any>;

/**
 * Type that represents a primitive except `null` and `undefined`
 *
 * @since 0.0.6
 * @category Models
 */
export type NonNullablePrimitive = string | number | bigint | boolean | symbol;

/**
 * Type that represents a primitive
 *
 * @since 0.0.6
 * @category Models
 */
export type Primitive = NonNullablePrimitive | null | undefined;

/**
 * Type that represents all possible Javascript values but not all possible Typescript types (it
 * does not represent for instance types like the intersection of a primitive and an object)
 *
 * @since 0.0.6
 * @category Models
 */
export type Unknown = Primitive | AnyRecord;

/**
 * Type that represents a function
 *
 * @since 0.0.6
 * @category Models
 */
export interface AnyFunction {
	(...a: ReadonlyArray<any>): any;
}

/**
 * Type that represents a function with one argument
 *
 * @since 0.0.6
 * @category Models
 */
export interface OneArgFunction<in A, out B = A> {
	(a: A): B;
}

/**
 * Type that represents an empty array or tuple
 *
 * @since 0.0.6
 * @category Models
 */
export type EmptyArray = readonly [];

/**
 * Type that represents a tuple or array with one element
 *
 * @since 0.0.6
 * @category Models
 */
export type Singleton<out A> = readonly [A];

/**
 * Type that represents a tuple or array with two elements
 *
 * @since 0.0.6
 * @category Models
 */
export type Pair<out A, out B> = readonly [A, B];

/**
 * Type that represents a non empty array
 *
 * @since 0.0.6
 * @category Models
 */
export type OverOne<out A> = readonly [A, ...ReadonlyArray<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @since 0.0.6
 * @category Models
 */
export type OverTwo<out A> = readonly [A, A, ...ReadonlyArray<A>];

/**
 * Type that represents any predicate or refinement
 *
 * @since 0.0.6
 * @category Models
 */
export type AnyPredicate = Predicate.Predicate<any>;

/**
 * Type that represents any refinement
 *
 * @since 0.0.6
 * @category Models
 */
export type AnyRefinement = Predicate.Refinement<any, any>;

/**
 * Type that represents any refinement from a given type
 *
 * @since 0.0.6
 * @category Models
 */
export type RefinementFrom<in Source> = Predicate.Refinement<Source, any>;

/**
 * Type that represents a value that can be used as an error
 *
 * @since 0.0.6
 * @category Models
 */
export type Errorish = { readonly message: string; readonly stack?: string | undefined };

/* eslint-disable-next-line functional/prefer-readonly-type */
type Enumerate<N extends number, Acc extends Array<number> = []> =
	/* eslint-disable-next-line functional/prefer-readonly-type */
	[Acc['length']] extends [N] ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Utility type that generates a range of numeric literal types
 *
 * @since 0.0.6
 * @category Utility types
 */
export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

/**
 * Utility type that extracts all elements of a tuple but the first
 *
 * @since 0.0.6
 * @category Utility types
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Tail<T extends AnyArray> = [T] extends [[any, ...infer R]] ? R : never;

/**
 * Utility type that alters all types of a tuple Tuple to Target
 *
 * @since 0.0.6
 * @category Utility types
 */
export type ToTupleOf<Tuple extends AnyArray, Target> = {
	readonly [k in keyof Tuple]: Target;
};

/**
 * Utility type that removes all non-data from a type
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Data<T extends AnyRecord> = {
	readonly [k in keyof T as readonly [k] extends (
		readonly [symbol | 'toString' | 'toJSON' | 'pipe' | `_${string}`]
	) ?
		never
	:	k]: T[k];
};

/**
 * Utility type that removes all data from a type
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Proto<T extends AnyRecord> = {
	readonly [k in keyof T as readonly [k] extends (
		readonly [symbol | 'toString' | 'toJSON' | 'pipe']
	) ?
		k
	:	never]: T[k];
};

/**
 * Constructs an object with prototype `proto` and data `data`
 *
 * @since 0.0.6
 * @category Utils
 */
export const objectFromDataAndProto = <P extends AnyRecord, D extends AnyRecord>(
	proto: P,
	data: D
): P & D => Object.assign(Object.create(proto), data) as P & D;

/**
 * Constructs an object with data `data`
 *
 * @since 0.0.6
 * @category Utils
 */
export const objectFromData = <D extends AnyRecord>(data: D): D => Object.assign(data) as D;

/**
 * Utility type that changes the type of the unique parameter of a OneArgFunction
 *
 * @since 0.5.0
 * @category Utility types
 */
export type WithArgType<F, A> =
	F extends Predicate.Refinement<_, infer R> ? Predicate.Refinement<A, R>
	: F extends OneArgFunction<any, infer R> ? OneArgFunction<A, R>
	: F;

/**
 * Utility type that removes all private, symbolic and toString, toJSON keys from a type and makes
 * all remaining properties optional
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PartialData<T extends AnyRecord> = Partial<Data<T>>;

/**
 * Utility type that creates an intersection of all types in a tuple
 *
 * @since 0.0.6
 * @category Utility types
 */
export type TupleToIntersection<T extends Readonly<AnyArray>> =
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
	: T extends Readonly<AnyArray> ? T
	: /* eslint-disable functional/prefer-readonly-type */ Array<unknown> /* eslint-enable functional/prefer-readonly-type */,
	T
>;

/**
 * From `unknown` to `Array`. Not based on Array.isArray from a Typescript perspective because it is
 * bugged. See https://github.com/microsoft/TypeScript/issues/17002
 *
 * @since 0.0.6
 * @category Guards
 */
export const isArray = <T>(arg: T): arg is ArrayType<T> => Array.isArray(arg);

/**
 * From `unknown` to `string`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isString = Predicate.isString;

/**
 * From `unknown` to `number`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNumber = Predicate.isNumber;

/**
 * From `unknown` to `bigint`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isBigInt = Predicate.isBigInt;

/**
 * From `unknown` to `boolean`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isBoolean = Predicate.isBoolean;

/**
 * From `unknown` to `symbol`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isSymbol = Predicate.isSymbol;

/**
 * From `unknown` to `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isUndefined = Predicate.isUndefined;

/**
 * From a type `T` to the same type `T` without `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotUndefined = Predicate.isNotUndefined;

/**
 * From a type `T` to `null` or `undefined` depending on what is in T
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNullable = Predicate.isNullable;

/**
 * From a type `T` to the same type `T` without `null` and `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotNullable = Predicate.isNotNullable;

/**
 * From `unknown` to `null`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNull = Predicate.isNull;

/**
 * From a type `T` to the same type `T` without `null`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotNull = Predicate.isNotNull;

/**
 * From `unknown` to `AnyFunction`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isFunction = (u: unknown): u is AnyFunction => typeof u === 'function';

/**
 * From `unknown` to any `OneArgFunction`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isOneArgFunction = (u: unknown): u is OneArgFunction<any, any> =>
	isFunction(u) && u.length > 0;

/**
 * From `unknown` to `AnyRecord`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isRecord = (u: unknown): u is AnyRecord =>
	['object', 'function'].includes(typeof u) && u !== null;

/**
 * From `unknown` to `Primitive`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isPrimitive = (u: unknown): u is Primitive => {
	const typeOfU = typeof u;
	return (typeOfU !== 'object' || u === null) && typeOfU !== 'function';
};

/**
 * From `unknown` to `Errorish`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isErrorish = (u: unknown): u is Errorish =>
	u !== null &&
	typeof u === 'object' &&
	'message' in u &&
	typeof u.message === 'string' &&
	(!('stack' in u) || typeof u.stack === 'string');

/**
 * From `ReadonlyArray<A>` to `EmptyArray`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isEmptyArray = <A>(u: ReadonlyArray<A>): u is EmptyArray => u.length === 0;

/**
 * From `ReadonlyArray<A>` to `OverOne<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isOverOne = <A>(u: ReadonlyArray<A>): u is OverOne<A> => u.length >= 1;

/**
 * From `ReadonlyArray<A>` to `OverTwo<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isOverTwo = <A>(u: ReadonlyArray<A>): u is OverTwo<A> => u.length >= 2;

/**
 * From `ReadonlyArray<A>` to `Singleton<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isSingleton = <A>(u: ReadonlyArray<A>): u is Singleton<A> => u.length === 1;

/**
 * A value with a covariant type
 *
 * @since 0.0.6
 * @category Constants
 */
export const covariantValue = (_: never) => _;

/**
 * A value with a contravariant type
 *
 * @since 0.0.6
 * @category Constants
 */
export const contravariantValue = (_: unknown) => _;

/**
 * A value with an invariant type
 *
 * @since 0.0.6
 * @category Constants
 */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const invariantValue = (_: any) => _;
