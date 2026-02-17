/**
 * A module that implements a `CVSemVer` brand, i.e. a string that represents a valid semantic
 * version. See the `Effect` documentation about Branding
 * (https://effect.website/docs/code-style/branded-types/) if you are not familiar with this
 * concept.
 */

import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Brand from 'effect/Brand'
import * as Either from 'effect/Either'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/primitive/SemVer/';

/**
 * Module TypeId
 *
 * @category Module markers
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * `CVSemVer` Type
 *
 * @category Models
 */
export type Type = Brand.Branded<string, _TypeId>;

/**
 * Constructs a `CVSemVer` without any verifications
 *
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Brand constructor. Should not be used directly
 *
 * @ignore
 */
export const constructor = Brand.refined<Type>(MString.isSemVer, (s) =>
  Brand.error(`'${s}' does not represent a semver`),
);

/**
 * Tries to construct a `CVSemVer` from a string. Returns a `Some` if the conversion can be
 * performed, a `None` otherwise
 *
 * @category Constructors
 */
export const fromStringOption: MTypes.OneArgFunction<
  string,
  Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Tries to construct a `CVSemVer` from a string. Returns a `Right` if the conversion can be
 * performed, a `Left` otherwise
 *
 * @category Constructors
 */
export const fromString: MTypes.OneArgFunction<
  string,
  Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);

/**
 * Constructs a `CVSemVer` if possible. Throws otherwise.
 *
 * @category Constructors
 */
export const fromStringOrThrow: MTypes.OneArgFunction<string, Type> = constructor;

/**
 * A `Schema` that transforms a string into a `CVSemVer`
 *
 * @ignore
 */
export const SchemaFromString: Schema.Schema<Type, string> = Schema.String.pipe(
  Schema.fromBrand(constructor),
);

/**
 * A `Schema` that represents a `CVSemVer`
 *
 * @ignore
 */
export const SchemaFromSelf: Schema.Schema<Type> = Schema.typeSchema(SchemaFromString);
