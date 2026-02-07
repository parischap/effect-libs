import { MString, MTypes } from "@parischap/effect-lib";
import { Brand, Either, flow, Number, Option } from "effect";

/**
 * Module tag
 *
 * @internal
 */
export const _moduleTag = "@parischap/conversions/Positive/";

/**
 * Module TypeId
 *
 * @internal
 */
export const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * `CVPositive` Type
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
  Number.greaterThanOrEqualTo(0),
  flow(
    MString.fromNumber(10),
    MString.prepend("'"),
    MString.append("' is not positive"),
    Brand.error,
  ),
);

/**
 * Tries to constructs a `CVPositive` from a number. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @internal
 */
export const fromNumberOption: MTypes.OneArgFunction<
  number,
  Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVPositive` from a number. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @internal
 */
export const fromNumber: MTypes.OneArgFunction<
  number,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVPositive` from a number if possible. Throws otherwise
 *
 * @internal
 */
export const fromNumberOrThrow: MTypes.OneArgFunction<number, Type> = constructor;
