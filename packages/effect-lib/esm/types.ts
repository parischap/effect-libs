/**
 * A simple type module
 *
 * @since 0.0.6
 */

import { Predicate } from 'effect';

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
 * Type that represents an array
 *
 * @since 0.0.6
 * @category Models
 */
export interface AnyArray extends Array<any> {}

/**
 * Type that represents a ReadonlyArray
 *
 * @since 0.5.0
 * @category Models
 */
export interface AnyReadonlyArray extends ReadonlyArray<any> {}

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
	(...args: ReadonlyArray<any>): any;
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

/** Type used to avoid warnings by eslint/functional when functions return a mutable array */
export interface MutableArray<T> extends Array<T> {}

/**
 * Type that represents an empty array or tuple
 *
 * @since 0.0.6
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type EmptyArray = [];

/**
 * Type that represents an empty array or tuple
 *
 * @since 0.0.6
 * @category Models
 */
export type EmptyReadonlyArray = readonly [];

/**
 * Type that represents a tuple or array with one element
 *
 * @since 0.0.6
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Singleton<A> = [A];

/**
 * Type that represents a tuple or array with one element
 *
 * @since 0.0.6
 * @category Models
 */
export type ReadonlySingleton<A> = readonly [A];

/**
 * Type that represents a tuple or array with two elements
 *
 * @since 0.0.6
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type Pair<A, B> = [A, B];

/**
 * Type that represents a tuple or array with two elements
 *
 * @since 0.0.6
 * @category Models
 */
export type ReadonlyPair<A, B> = readonly [A, B];

/**
 * Type that represents a non empty array
 *
 * @since 0.0.6
 * @category Models
 */

/* eslint-disable-next-line functional/prefer-readonly-type */
export type OverOne<A> = [A, ...Array<A>];

/**
 * Type that represents a non empty array
 *
 * @since 0.0.6
 * @category Models
 */
export type ReadonlyOverOne<A> = readonly [A, ...ReadonlyArray<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @since 0.0.6
 * @category Models
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export type OverTwo<A> = [A, A, ...Array<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @since 0.0.6
 * @category Models
 */
export type ReadonlyOverTwo<A> = readonly [A, A, ...ReadonlyArray<A>];

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
export type RefinementFrom<Source> = Predicate.Refinement<Source, any>;

/**
 * Type that represents a value that can be used as an error
 *
 * @since 0.0.6
 * @category Models
 */
export type Errorish = { readonly message: string; readonly stack?: string | undefined };

/**
 * Type of a string transformer, i.e a function that transforms a string into another one
 *
 * @since 0.5.0
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

type BaseProtoKeys = symbol | 'toString' | 'toJSON' | 'pipe';

/**
 * Utility type that removes all non-data from a type.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Data<T extends AnyRecord, ProtoFunctions extends string | symbol = never> = {
	readonly [k in keyof T as readonly [k] extends readonly [BaseProtoKeys | ProtoFunctions] ? never
	:	k]: T[k];
};

/**
 * Utility type that removes all data from a type
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Proto<T extends AnyRecord, ProtoFunctions extends string | symbol = never> = Omit<
	T,
	keyof Data<T, ProtoFunctions>
>;

/**
 * Utility type that returns all the keys of a record whose value is a function except those which
 * are in the BaseProtoKeys list.
 */
/*export type NonSymbolicFunctionKeys<T extends AnyRecord> = keyof {
	readonly [k in keyof T as readonly [k] extends readonly [BaseProtoKeys] ? never
	: readonly [T[k]] extends readonly [AnyFunction] ? k
	: never]: void;
};*/

/**
 * Utility type that transforms a functions with several arguments into a function with one argument
 *
 * @since 0.5.0
 * @category Utility types
 */
export type toOneArgFunction<F extends AnyFunction> =
	F extends () => any ? never : (arg1: Parameters<F>[0]) => ReturnType<F>;

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
 * Utility type that changes the type of the unique parameter of a OneArgFunction to `A` when
 * possible
 *
 * @since 0.5.0
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
 * @since 0.5.0
 * @category Utility types
 */
/*export type ToPredicates<R extends AnyRecord> = {
	readonly [k in keyof Data<R>]: Predicate.Predicate<R[k]>;
};*/

/**
 * Utility type that creates an intersection of all types in a tuple/record
 *
 * @since 0.0.6
 * @category Utility types
 */
export type TupleToIntersection<T extends AnyRecord> =
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
export const isString = (input: unknown): input is string => typeof input === 'string';

/**
 * From `unknown` to `number`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNumber = (input: unknown): input is number => typeof input === 'number';

/**
 * From `unknown` to `bigint`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isBigInt = (input: unknown): input is bigint => typeof input === 'bigint';

/**
 * From `unknown` to `boolean`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isBoolean = (input: unknown): input is boolean => typeof input === 'boolean';

/**
 * From `unknown` to `symbol`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isSymbol = (input: unknown): input is symbol => typeof input === 'symbol';

/**
 * From `unknown` to `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isUndefined = (input: unknown): input is undefined => input === undefined;

/**
 * From a type `T` to the same type `T` without `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotUndefined = <A>(input: A): input is Exclude<A, undefined> => input !== undefined;

/**
 * From a type `T` to `null` or `undefined` depending on what is in T
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNullable = <A>(input: A): input is Extract<A, null | undefined> =>
	input === null || input === undefined;

/**
 * From a type `T` to the same type `T` without `null` and `undefined`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotNullable = <A>(input: A): input is NonNullable<A> =>
	input !== null && input !== undefined;

/**
 * From `unknown` to `null`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNull = (input: unknown): input is null => input === null;

/**
 * From a type `T` to the same type `T` without `null`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isNotNull = <A>(input: A): input is Exclude<A, null> => input !== null;

/**
 * From `unknown` to `AnyFunction`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isFunction = (u: unknown): u is AnyFunction => typeof u === 'function';

/**
 * From `unknown` to `AnyRecord`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isRecord = (u: unknown): u is AnyRecord =>
	u !== null && ['object', 'function'].includes(typeof u);

/**
 * From `unknown` to `Primitive`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isPrimitive = (u: unknown): u is Primitive =>
	u === null || !['object', 'function'].includes(typeof u);

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
 * From `Array<A>` to `EmptyArray`
 *
 * @since 0.0.6
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isEmptyArray = <A>(u: Array<A>): u is EmptyArray => u.length === 0;

/**
 * From `ReadonlyArray<A>` to `EmptyReadonlyArray`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isEmptyReadonlyArray = <A>(u: ReadonlyArray<A>): u is EmptyReadonlyArray =>
	u.length === 0;

/**
 * From `Array<A>` to `OverOne<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isOverOne = <A>(u: Array<A>): u is OverOne<A> => u.length >= 1;

/**
 * From `ReadonlyArray<A>` to `ReadonlyOverOne<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isReadonlyOverOne = <A>(u: ReadonlyArray<A>): u is ReadonlyOverOne<A> => u.length >= 1;

/**
 * From `Array<A>` to `OverTwo<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isOverTwo = <A>(u: Array<A>): u is OverTwo<A> => u.length >= 2;

/**
 * From `ReadonlyArray<A>` to `ReadonlyOverTwo<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isReadonlyOverTwo = <A>(u: ReadonlyArray<A>): u is ReadonlyOverTwo<A> => u.length >= 2;

/**
 * From `Array<A>` to `Singleton<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
/* eslint-disable-next-line functional/prefer-readonly-type */
export const isSingleton = <A>(u: Array<A>): u is Singleton<A> => u.length === 1;

/**
 * From `ReadonlyArray<A>` to `ReadonlySingleton<A>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isReadonlySingleton = <A>(u: ReadonlyArray<A>): u is ReadonlySingleton<A> =>
	u.length === 1;

/**
 * From `F` to `toOneArgFunction<F>`
 *
 * @since 0.0.6
 * @category Guards
 */
export const isOneArgFunction = <F extends AnyFunction>(
	f: F | toOneArgFunction<F>
): f is toOneArgFunction<F> => f.length === 1;

/**
 * Namespace for the possible categories of a Javascript value
 *
 * @since 0.5.0
 * @category Models
 */
export namespace Category {
	/**
	 * Type of a Category
	 *
	 * @since 0.5.0
	 * @category Models
	 */
	export enum Type {
		Primitive = 0,
		NonNullObject = 1,
		Array = 2,
		Function = 3
	}

	/**
	 * Constructor
	 *
	 * @since 0.5.0
	 * @category Constructors
	 */
	export const fromValue = (u: unknown): Type => {
		switch (typeof u) {
			case 'function':
				return Type.Function;
			case 'object':
				return (
					u === null ? Type.Primitive
					: Array.isArray(u) ? Type.Array
					: Type.NonNullObject
				);
			default:
				return Type.Primitive;
		}
	};
}

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
