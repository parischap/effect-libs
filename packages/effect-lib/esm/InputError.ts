/** A module that implements an error that occurs upon receiving an unexpected input */

import { Data, Either, flow, Function, Number, Option, pipe, Predicate, String } from 'effect';
import * as MFunction from './Function.js';
import * as MString from './String.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/effect-lib/InputError/';

/**
 * Type of an InputError
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
	readonly message: string;
}> {}

const _nameLabel: MTypes.OneArgFunction<string | undefined, string> = flow(
	Option.liftPredicate(MTypes.isString),
	Option.getOrElse(Function.constant('value'))
);
/**
 * Builds an Input error that signals a wrong value
 *
 * @category Constructors
 */
export const wrongValue = <T extends MTypes.NonNullablePrimitive>({
	expected,
	actual,
	name
}: {
	readonly expected: T;
	readonly actual: T;
	readonly name?: string;
}) => {
	const expectedString = MTypes.isString(expected) ? `'${expected}'` : expected.toString();
	const actualString = MTypes.isString(actual) ? `'${actual}'` : actual.toString();
	return new Type({
		message: `Expected ${_nameLabel(name)} to be: ${expectedString}. Actual: ${actualString}`
	});
};

/**
 * Returns a `right` of `input` if `input` is equal to `expected`. Otherwise, returns a `left` of an
 * InputError
 *
 * @category Constructors
 */
export const assertValue = <T extends MTypes.NonNullablePrimitive>(params: {
	readonly expected: NoInfer<T>;
	readonly name?: string;
}): MTypes.OneArgFunction<T, Either.Either<T, Type>> =>
	Either.liftPredicate(MFunction.strictEquals(params.expected), (actual) =>
		wrongValue({ ...params, actual })
	);

/**
 * Builds an Input error that signals a missized ArrayLike
 *
 * @category Constructors
 */
export const missized = ({
	expected,
	actual,
	name
}: {
	readonly expected: number;
	readonly actual: number;
	readonly name?: string;
}) =>
	new Type({
		message: `Expected length of ${_nameLabel(name)} to be: ${expected}. Actual: ${actual}`
	});

/**
 * Returns a `right` of `input` if `input` has the expected length. Otherwise, returns a `left` of
 * an InputError
 *
 * @category Constructors
 */
export const assertLength = <A extends ArrayLike<unknown> | string>(params: {
	readonly expected: number;
	readonly name?: string;
}): MTypes.OneArgFunction<A, Either.Either<A, Type>> =>
	Either.liftPredicate(
		(arrayLike) => arrayLike.length === params.expected,
		(actual) => missized({ ...params, actual: actual.length })
	);

/**
 * Builds an Input error that signals a value out of bounds
 *
 * @category Constructors
 */
export const outOfBound = ({
	min,
	max,
	actual,
	name
}: {
	readonly min: number;
	readonly max: number;
	readonly actual: number;
	readonly name?: string;
}) =>
	new Type({
		message: `Expected ${_nameLabel(name)} to be between ${min} and ${max} included. Actual: ${actual}`
	});

/**
 * Returns a `right` of `input` if `input` has the expected size. Otherwise, returns a `left` of an
 * InputError
 *
 * @category Constructors
 */
export const assertInRange = (params: {
	readonly min: number;
	readonly max: number;
	readonly name?: string;
}): MTypes.OneArgFunction<number, Either.Either<number, Type>> =>
	Either.liftPredicate(
		Predicate.and(Number.greaterThanOrEqualTo(params.min), Number.lessThanOrEqualTo(params.max)),
		(actual) => outOfBound({ ...params, actual })
	);

/**
 * Builds an Input error that signals a string not starting with
 *
 * @category Constructors
 */
export const notStartingWith = ({
	startString,
	actual,
	name
}: {
	readonly startString: string;
	readonly actual: string;
	readonly name?: string;
}) =>
	new Type({
		message: `Expected ${_nameLabel(name)} to start with '${startString}'. Actual: '${actual}'`
	});

/**
 * Returns a `right` of `input` stripped of `startString` if `input` starts with `startString`.
 * Otherwise, returns a `left` of an InputError
 *
 * @category Constructors
 */
export const assertStartsWithAndStrip =
	(params: { readonly startString: string; readonly name?: string }) =>
	(actual: string): Either.Either<string, Type> =>
		pipe(
			actual,
			MString.stripLeftOption(params.startString),
			Either.fromOption(() => notStartingWith({ ...params, actual }))
		);

/**
 * Builds an Input error that signals a string that is not empty
 *
 * @category Constructors
 */
export const notEmpty = ({ actual, name }: { readonly actual: string; readonly name?: string }) =>
	new Type({
		message: `Expected ${_nameLabel(name)} to be empty. Actual: '${actual}'`
	});

/**
 * Returns a `right` of `input` if `input` isnot the empty string. Otherwise, returns a `left` of an
 * InputError
 *
 * @category Constructors
 */
export const assertEmpty = (
	params: {
		readonly name?: string;
	} = {}
): MTypes.OneArgFunction<string, Either.Either<string, Type>> =>
	Either.liftPredicate(String.isEmpty, (actual) => notEmpty({ ...params, actual }));
