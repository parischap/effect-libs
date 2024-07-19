import { Array, Predicate } from 'effect';

// Unknown or never don't work as well as any when it comes to inference
/* eslint @typescript-eslint/no-explicit-any:off */
/**
 * Type that represents a record. From a typescript perspective, this covers arrays, objects, class instances and functions but not not null and undefined
 */
export interface AnyRecord {
	readonly [key: string | symbol]: any;
}

/**
 * Type created to avoid eslint errors
 */
// eslint-disable-next-line functional/prefer-readonly-type
type ReturnArray<out T> = Array<T>;
export { type ReturnArray as Array };

/**
 * Type that represents an array
 */
export type AnyArray = ReturnArray<any>;

export type NonNullPrimitive = string | number | bigint | boolean | symbol;
export type Primitive = NonNullPrimitive | null | undefined;

/**
 * Type that represents all possible javascript values (it does not represent types like the intersection of a primitive and an object)
 */
export type Unknown = Primitive | AnyRecord;

/**
 * Type that represents a function
 */
export interface AnyFunction {
	(...a: ReadonlyArray<any>): any;
}

/**
 * Type that represents a function with one argument
 */
export interface OneArgFunction<in A, out B = A> {
	(a: A): B;
}

/**
 * Empty array or tuple
 * @category models
 */
export type EmptyArray = readonly [];

/**
 * Tuple or array with one element
 * @category models
 */
export type Singleton<out A> = readonly [A];

/**
 * Tuple or array with two elements
 * @category models
 */

export type Pair<out A, out B> = readonly [A, B];

/**
 * NonEmptyArray
 * @category models
 */
export type OverOne<out A> = readonly [A, ...ReadonlyArray<A>];

/**
 * Array with at least one element
 * @category models
 */
export type OverTwo<out A> = readonly [A, A, ...ReadonlyArray<A>];

/**
 * @category models
 */
export type AnyPredicate = Predicate.Predicate<any>;

/**
 * @category models
 */
export type AnyRefinement = Predicate.Refinement<any, any>;

/**
 * @category models
 */
export type RefinementFrom<in Source> = Predicate.Refinement<Source, any>;

/**
 * @category models
 */
export type Errorish = { readonly message: string; readonly stack?: string | undefined };

// Utility types
/**
 * Utility type that generates a range of numeric literal types
 */
// eslint-disable-next-line functional/prefer-readonly-type
type Enumerate<N extends number, Acc extends Array<number> = []> =
	// eslint-disable-next-line functional/prefer-readonly-type
	[Acc['length']] extends [N] ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

/**
 * Utility type that extracts all elements of a tuple but the first
 */
// eslint-disable-next-line functional/prefer-readonly-type
export type Tail<T extends AnyArray> = [T] extends [[any, ...infer R]] ? R : never;

/**
 * Utility type that alters all types of a tuple Tuple to Target
 */
export type ToTupleOf<Tuple extends AnyArray, Target> = {
	readonly [k in keyof Tuple]: Target;
};

/**
 * Utility type that removes all symbolic and toString, toJSON keys from a type
 */
export type DataWithPrivates<T> = {
	readonly [k in keyof T as readonly [k] extends readonly [symbol | 'toString' | 'toJSON'] ? never
	:	k]: T[k];
};

/**
 * Utility type that removes all private, symbolic and toString, toJSON keys from a type
 */
export type Data<T> = {
	readonly [k in keyof T as readonly [k] extends (
		readonly [symbol | 'toString' | 'toJSON' | `_${string}`]
	) ?
		never
	:	k]: T[k];
};

/**
 * Utility type that removes all private, symbolic and toString, toJSON keys from a type and makes all remaining properties optional
 */
export type PartialData<T> = Partial<Data<T>>;

/**
 * Utility type that creates an intersection of all types in a tuple
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

/**
 * Utility type that makes properties `Properties` readonly in type `T`
 */
export type MakePropReadonly<T, Properties extends keyof T> =
	// eslint-disable-next-line functional/prefer-readonly-type
	{
		[K in keyof Omit<T, Properties>]: T[K];
	} & {
		readonly [K in Properties]: T[K];
	};

// Type guards
/**
 * The following code corrects a bug in typescript where Array.isArray narrows a ReadonlyArray to any[]. To remove when this bug has been corrected. See https://github.com/microsoft/TypeScript/issues/17002
 */
export type ArrayType<T> = Extract<
	true extends T & false ? AnyArray
	: T extends Readonly<AnyArray> ? T
	: // eslint-disable-next-line functional/prefer-readonly-type
		Array<unknown>,
	T
>;

export const isString = Predicate.isString;
export const isNumber = Predicate.isNumber;
export const isBigInt = Predicate.isBigInt;
export const isBoolean = Predicate.isBoolean;
export const isSymbol = Predicate.isSymbol;
export const isUndefined = Predicate.isUndefined;
export const isNotUndefined = Predicate.isNotUndefined;
export const isNullable = Predicate.isNullable;
export const isNotNullable = Predicate.isNotNullable;
export const isNull = Predicate.isNull;
export const isNotNull = Predicate.isNotNull;
export const isFunction = (u: unknown): u is AnyFunction => typeof u === 'function';
export const isOneArgFunction = (u: unknown): u is OneArgFunction<any, any> =>
	isFunction(u) && u.length > 0;
export const isRecord = (u: unknown): u is AnyRecord =>
	['object', 'function'].includes(typeof u) && u !== null;
export const isArray = <T>(arg: T): arg is ArrayType<T> => Array.isArray(arg);
export const isPrimitive = (u: unknown): u is Primitive => {
	const typeOfU = typeof u;
	return (typeOfU !== 'object' || u === null) && typeOfU !== 'function';
};

export const isErrorish = (u: unknown): u is Errorish =>
	u !== null &&
	typeof u === 'object' &&
	'message' in u &&
	typeof u.message === 'string' &&
	(!('stack' in u) || typeof u.stack === 'string');

export const isEmptyArray = <A>(u: ReadonlyArray<A>): u is EmptyArray => u.length === 0;
export const isOverOne = <A>(u: ReadonlyArray<A>): u is OverOne<A> => u.length >= 1;
export const isOverTwo = <A>(u: ReadonlyArray<A>): u is OverTwo<A> => u.length >= 2;
export const isSingleton = <A>(u: ReadonlyArray<A>): u is Singleton<A> => u.length === 1;
