/**
 * A module that implements a `CVEmail` brand, i.e. a string that represents a valid email. See the
 * `Effect` documentation about Branding (https://effect.website/docs/code-style/branded-types/) if
 * you are not familiar with this concept.
 */

import { MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, Option, Schema } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/primitive/Email/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * Email type
 *
 * @category Models
 */
export type Type = Brand.Branded<string, _TypeId>;

/**
 * Constructs an Email without any verifications
 *
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Brand constructor. Should not be used directly
 *
 * @internal
 */
export const constructor = Brand.refined<Type>(MString.isEmail, (s) =>
  Brand.error(`'${s}' does not represent a email`),
);

/**
 * Constructs an Option of an Email from a string.
 *
 * @category Constructors
 */
export const fromStringOption: MTypes.OneArgFunction<
  string,
  Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of an Email from a string.
 *
 * @category Constructors
 */
export const fromString: MTypes.OneArgFunction<
  string,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs an Email if possible. Throws otherwise.
 *
 * @category Constructors
 */
export const fromStringOrThrow: MTypes.OneArgFunction<string, Type> = constructor;

/**
 * A Schema that transforms a string into a CVBrand.Email.Type
 *
 * @ignore
 */
export const SchemaFromString: Schema.Schema<Type, string> = Schema.String.pipe(
  Schema.fromBrand(constructor),
);

/**
 * A Schema that represents a CVBrand.Email.Type
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromString);
