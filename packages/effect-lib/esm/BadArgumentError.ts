/**
 * Module that simplifies the handling of bad arguments
 *
 * @since 0.0.6
 */

import {
	Array,
	Data,
	Either,
	HashMap,
	HashSet,
	Number,
	Option,
	Predicate,
	Struct,
	flow,
	pipe
} from 'effect';
import * as MFunction from './Function.js';
import * as MString from './String.js';

/**
 * @since 0.0.6
 * @category Models
 */
interface BaseType {
	/**
	 * Name of the argument that had the error
	 *
	 * @since 0.0.6
	 */
	readonly id: string;
	/**
	 * Positions where the bad argument was encountered
	 *
	 * @since 0.0.6
	 */
	readonly positions: ReadonlyArray<number>;
	/**
	 * Tag of the module containing the function that received a bad argument
	 *
	 * @since 0.0.6
	 */
	readonly moduleTag: string;
	/**
	 * Name of the function that received a bad argument
	 *
	 * @since 0.0.6
	 */
	readonly functionName: string;
}

/** Returns a string indicating where the error occured */
const baseString = (self: BaseType): string =>
	`${self.moduleTag}${self.functionName}: argument '${self.id}'` +
	(self.positions.length === 0 ? ''
	: self.positions.length === 1 ? ` at position ${self.positions[0]}`
	: 'at positions ' + pipe(self.positions, Array.map(String), Array.join(',')));

/** Maps the id of this error. The mapping function receives the position as second argument */
/*export const mapId =
	(f: (id: string, position?: number) => string) =>
	<B extends BaseType>(self: B): B => ({ ...self, id: f(self.id, self.position) });*/

/**
 * Returns a copy of this error where moduleTag and functionName have been modified
 *
 * @since 0.0.6
 * @category Setters
 */
export const setModuleTagAndFunctionName =
	(moduleTag: string, functionName: string) =>
	<B extends BaseType>(self: B): B => ({ ...self, moduleTag, functionName });

/** Returns a copy of this error where the position has been modified */
/*export const setPosition =
	(position?: number) =>
	<B extends BaseType>(self: B): B => ({ ...self, position });*/

/** OutOfRange signals an out-of-range bad argument */
interface OutOfRangeType extends BaseType {
	/** Actual value received */
	readonly actual: number;
	/** Lowest value accepted (inclusive) */
	readonly min: number;
	/** Highest value accepted (inclusive) */
	readonly max: number;
}

/**
 * OutOfRange signals an out-of-range error
 *
 * @since 0.0.6
 * @category Models
 */
export class OutOfRange extends Data.TaggedError('BadArgument.OutOfRange')<OutOfRangeType> {
	/**
	 * Error message getter
	 *
	 * @since 0.0.6
	 * @category Getters
	 */
	override get message() {
		return `${baseString(this)} is out of range. Actual:${this.actual}, expected: integer between ${this.min} and ${this.max} inclusive.`;
	}

	/**
	 * Returns actual if actual is within range. Otherwise, returns an OutOfRange error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly check =
		({
			min,
			max,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly min: number;
			readonly max: number;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(actual: number): Either.Either<number, OutOfRange> =>
			pipe(
				actual,
				Either.liftPredicate(
					Predicate.and(Number.greaterThanOrEqualTo(min), Number.lessThanOrEqualTo(max)),
					() => new OutOfRange({ min, max, id, positions, moduleTag, functionName, actual })
				)
			);
}

/** DisallowedValue signals a value that does not belong to a predefined set of values */
interface DisallowedValueType<out K extends string> extends BaseType {
	/** Actual value received */
	readonly actual: K;
	/** Array of allowed values */
	readonly allowedValues: HashSet.HashSet<K>;
}

/**
 * DisallowedValue signals a value that does not belong to a predefined set of values
 *
 * @since 0.0.6
 * @category Models
 */
export class DisallowedValue<K extends string> extends Data.TaggedError(
	'BadArgument.DisallowedValue'
)<DisallowedValueType<K>> {
	/**
	 * Error message getter
	 *
	 * @since 0.0.6
	 * @category Getters
	 */
	override get message() {
		return `${baseString(this)} has disallowed value. Actual:${this.actual}, expected: one of ${Array.join(this.allowedValues, ', ')}.`;
	}

	/**
	 * Returns actual if actual belongs to the allowed values. Otherwise, returns an DisallowedValue
	 * error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly check =
		<K extends string>({
			allowedValues,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly allowedValues: HashSet.HashSet<K>;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(actual: K): Either.Either<K, DisallowedValue<K>> =>
			pipe(
				actual,
				Either.liftPredicate(
					Predicate.not(MFunction.flipDual(HashSet.has<K>)(allowedValues)),
					() =>
						new DisallowedValue({
							allowedValues,
							id,
							positions,
							moduleTag,
							functionName,
							actual
						})
				)
			);

	/**
	 * Returns the value associated to actual in the provided map if actual belongs to the map.
	 * Otherwise, returns a DisallowedValue error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly checkAndMap =
		<K extends string, V>({
			allowedValues,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly allowedValues: HashMap.HashMap<K, V>;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(actual: K): Either.Either<V, DisallowedValue<K>> =>
			pipe(
				allowedValues,
				HashMap.get(actual),
				Either.fromOption(
					() =>
						new DisallowedValue({
							id,
							positions,
							moduleTag,
							functionName,
							actual,
							allowedValues: HashMap.keySet(allowedValues)
						})
				)
			);
}

/** BadLength signals an arraylike whose length is incorrect */
interface BadLengthType extends BaseType {
	/** Actual length */
	readonly actual: number;
	/** Expected length */
	readonly expected: number;
}

/**
 * BadLength signals an arraylike whose length is incorrect
 *
 * @since 0.0.6
 * @category Models
 */
export class BadLength extends Data.TaggedError('BadArgument.BadLength')<BadLengthType> {
	/**
	 * Error message getter
	 *
	 * @since 0.0.6
	 * @category Getters
	 */
	override get message() {
		return `${baseString(this)} does not have expected size'. Actual:${this.actual}, expected: ${this.expected}.`;
	}

	/**
	 * Returns target if target.length has the expected length. Otherwise returns a BadLength error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly check =
		<T extends ArrayLike<unknown>>({
			expected,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly expected: number;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(target: T): Either.Either<T, BadLength> =>
			pipe(
				target,
				Either.liftPredicate(
					flow(Struct.get('length'), MFunction.strictEquals(expected)),
					() =>
						new BadLength({
							expected,
							id,
							positions,
							moduleTag,
							functionName,
							actual: target.length
						})
				)
			);
}

/**
 * TwoMany signals an argument that receives more values than it expects
 *
 * @category Models
 */
interface TooManyType<out T> extends BaseType {
	/** The list of received values */
	readonly elements: ReadonlyArray<T>;
}

/**
 * TwoMany signals an argument that receives more values than it expects
 *
 * @since 0.0.6
 * @category Models
 */
export class TooMany<T> extends Data.TaggedError('BadArgument.TooMany')<TooManyType<T>> {
	/**
	 * Error message getter
	 *
	 * @since 0.0.6
	 * @category Getters
	 */
	override get message() {
		return `${baseString(this)} received too many values:${pipe(this.elements, Array.map(String), Array.join(', '))}.`;
	}
}

/** BadFormat signals an argument that receives a value that does not match the expected format */
interface BadFormatType extends BaseType {
	/** Data received */
	readonly actual: string;
	/** Expected format */
	readonly expected: string;
}

/**
 * BadFormat signals an argument that receives a value that does not match the expected format
 *
 * @since 0.0.6
 * @category Models
 */
export class BadFormat extends Data.TaggedError('BadArgument.BadFormat')<BadFormatType> {
	/**
	 * Error message getter
	 *
	 * @since 0.0.6
	 * @category Getters
	 */
	override get message() {
		return `${baseString(this)} does not match expected format. Received:${this.actual}, expected format: ${this.expected}.`;
	}

	/**
	 * Returns target if target is strictly equal to expected. Otherwise, returns a BadFormat error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly check =
		({
			expected,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly expected: string;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(target: string): Either.Either<string, BadFormat> =>
			pipe(
				target,
				Either.liftPredicate(
					MFunction.strictEquals(expected),
					(actual) =>
						new BadFormat({
							expected,
							id,
							positions,
							moduleTag,
							functionName,
							actual
						})
				)
			);

	/**
	 * Returns the part of target that matches expected. If no match is found, returns a BadFormat
	 * error
	 *
	 * @since 0.0.6
	 * @category Error handling
	 */
	static readonly extractMatch =
		({
			expected,
			id,
			positions = [],
			moduleTag,
			functionName
		}: {
			readonly expected: RegExp;
			readonly id: string;
			readonly positions?: ReadonlyArray<number>;
			readonly moduleTag: string;
			readonly functionName: string;
		}) =>
		(target: string): Either.Either<string, BadFormat> =>
			pipe(
				target,
				MString.match(expected),
				Option.map((arr) => arr[0]),
				Either.fromOption(
					() =>
						new BadFormat({
							id,
							positions,
							moduleTag,
							functionName,
							actual: target,
							expected: `RegExp(${expected.source})`
						})
				)
			);
}

/** General is to be used when nothing more specific matches */
interface GeneralType extends BaseType {
	readonly message: string;
}

/**
 * General is to be used when nothing more specific matches
 *
 * @since 0.0.6
 * @category Models
 */
export class General extends Data.TaggedError('BadArgument.General')<GeneralType> {}
