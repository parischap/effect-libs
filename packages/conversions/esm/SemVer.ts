/** A module that implements a SemVer brand */

import { MString, MTypes } from '@parischap/effect-lib';
import { Brand, Either, Option } from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/SemVer/';

export const TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof TypeId;

/**
 * SemVer type
 *
 * @category Models
 */
export type Type = Brand.Branded<string, _TypeId>;

/**
 * Constructs a SemVer without any verifications
 *
 * @category Constructors
 */
export const unsafeFromString = Brand.nominal<Type>();

/**
 * Constructs a SemVer from a string. Throws an error if the provided string does not represent a
 * semver
 *
 * @category Constructors
 */
export const constructor = Brand.refined<Type>(MString.isSemVer, (s) =>
	Brand.error(`'${s}' does not represent a semver`)
);

/**
 * Constructs an Option of a SemVer from a string.
 *
 * @category Constructors
 */
export const fromStringOption: MTypes.OneArgFunction<
	string,
	Option.Option<Type>
> = constructor.option.bind(constructor);

/**
 * Constructs an Either of a SemVer from a string.
 *
 * @category Constructors
 */
export const fromString: MTypes.OneArgFunction<
	string,
	Either.Either<Type, Brand.Brand.BrandErrors>
> = constructor.either.bind(constructor);
