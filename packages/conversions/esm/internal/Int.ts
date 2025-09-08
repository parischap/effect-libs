import { MNumber, MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, flow, Option } from 'effect';

/**
 * Module tag
 *
 * @internal
 */
const _moduleTag = '@parischap/conversions/Int/';

/**
 * Module TypeId
 *
 * @internal
 */
export const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * CVInt type
 *
 * @internal
 */
export type Type = Brand.Branded<number, _TypeId>;

/**
 * Brand constructor. Should not be used directly
 *
 * @internal
 */
export const constructor = Brand.refined<Type>(
	MNumber.isInt,
	flow(
		MString.fromNumber(10),
		MString.prepend("'"),
		MString.append("' does not represent an integer"),
		Brand.error
	)
);

/**
 * Tries to construct a CVInt from a number. Returns a `Some` if the conversion can be performed, a
 * `None` otherwise
 *
 * @internal
 */
export const fromNumberOption: MTypes.OneArgFunction<
	number,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to constructs a `CVInt` from a number. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @internal
 */
export const fromNumber: MTypes.OneArgFunction<
	number,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVInt` from a number if possible. Throws otherwise
 *
 * @internal
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;
