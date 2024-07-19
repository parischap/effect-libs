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
 * @category models
 */
interface BaseType {
	// Name of the argument that had the error
	readonly id: string;
	readonly positions: ReadonlyArray<number>;
	readonly moduleTag: string;
	readonly functionName: string;
}

/**
 * Returns a string indicating where the error occured
 * @category utils
 */
const baseString = (self: BaseType): string =>
	`${self.moduleTag}${self.functionName}: argument '${self.id}' at positions ` +
	pipe(self.positions, Array.map(String), Array.join(','));

/**
 * Maps the id of this error. The mapping function receives the position as second argument
 * @category setters
 */
/*export const mapId =
	(f: (id: string, position?: number) => string) =>
	<B extends BaseType>(self: B): B => ({ ...self, id: f(self.id, self.position) });*/

/**
 * Returns a copy of this error where moduleTag and functionName have been modified
 * @category setters
 */
export const setModuleTagAndFunctionName =
	(moduleTag: string, functionName: string) =>
	<B extends BaseType>(self: B): B => ({ ...self, moduleTag, functionName });

/**
 * Returns a copy of this error where the position has been modified
 * @category setters
 */
/*export const setPosition =
	(position?: number) =>
	<B extends BaseType>(self: B): B => ({ ...self, position });*/

/**
 * OutOfRange signals an out-of-range error
 * @category models
 */
export class OutOfRange extends Data.TaggedError('BadArgumentOutOfRange')<OutOfRangeType> {
	override get message() {
		return `${baseString(this)} is out of range. Actual:${this.actual}, expected: integer between ${this.min} included and ${this.max} included.`;
	}

	/**
	 * Returns actual if actual is within range. Otherwise, returns an OutOfRange error
	 * @category utils
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
				MFunction.filter(
					flow(
						Option.liftPredicate(
							Predicate.and(Number.greaterThanOrEqualTo(min), Number.lessThanOrEqualTo(max))
						),
						Option.map(
							() => new OutOfRange({ min, max, id, positions, moduleTag, functionName, actual })
						)
					)
				)
			);
}

interface OutOfRangeType extends BaseType {
	// ValueWrapper of the argument
	readonly actual: number;
	// Lowest value accepted (included)
	readonly min: number;
	// Highest value accepted (included)
	readonly max: number;
}

/**
 * DisallowedValue signals a value that does not belong to a predefined set of values
 * @category models
 */
export class DisallowedValue<K extends string> extends Data.TaggedError(
	'BadArgumentDisallowedValue'
)<DisallowedValueType<K>> {
	override get message() {
		return `${baseString(this)} has disallowed value. Actual:${this.actual}, expected: one of ${Array.join(this.allowedValues, ', ')}.`;
	}

	/**
	 * Returns actual if actual belongs to the allowed values. Otherwise, returns an DisallowedValue error
	 * @category utils
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
				MFunction.filter(
					flow(
						Option.liftPredicate(MFunction.flipDual(HashSet.has<K>)(allowedValues)),
						Option.map(
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
					)
				)
			);

	/**
	 * Returns the value associated to actual in the provided map if actual belongs to the map. Otherwise, returns an DisallowedValue error
	 * @category utils
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

interface DisallowedValueType<out K extends string> extends BaseType {
	// ValueWrapper of the argument
	readonly actual: K;
	// Array of allowed values
	readonly allowedValues: HashSet.HashSet<K>;
}

/**
 * BadLength signals an arraylike whose lentgth is incorrect
 * @category models
 */
export class BadLength extends Data.TaggedError('BadArgumentBadLength')<BadLengthType> {
	override get message() {
		return `${baseString(this)} does not have expected size'. Actual:${this.actual}, expected: ${this.expected}.`;
	}

	/**
	 * Returns target if target.length has the expected length. Otherwise returns a BadLength error
	 * @category utils
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
				MFunction.filter(
					flow(
						Option.liftPredicate(flow(Struct.get('length'), MFunction.strictEquals(expected))),
						Option.map(
							(arrayLike) =>
								new BadLength({
									expected,
									id,
									positions,
									moduleTag,
									functionName,
									actual: arrayLike.length
								})
						)
					)
				)
			);
}

interface BadLengthType extends BaseType {
	// Current length
	readonly actual: number;
	// Expected length
	readonly expected: number;
}

/**
 * TwoMany signals an argument that receives more values than it expects
 * @category models
 */
export class TooMany<T> extends Data.TaggedError('BadArgumentTooMany')<TooManyType<T>> {
	override get message() {
		return `${baseString(this)} received too many values:${pipe(this.elements, Array.map(String), Array.join(', '))}.`;
	}
}

interface TooManyType<out T> extends BaseType {
	// The list of received values
	readonly elements: ReadonlyArray<T>;
}

/**
 * BadFormat signals an argument that receives a value that does not match the expected format
 * @category models
 */
export class BadFormat extends Data.TaggedError('BadArgumentBadFormat')<BadFormatType> {
	override get message() {
		return `${baseString(this)} does not match expected format. Received:${this.actual}, expected format: ${this.expected}.`;
	}

	/**
	 * Returns target if target is strictly equal to expected. Otherwise, returns a BadFormat error
	 * @category utils
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
				MFunction.filter(
					flow(
						Option.liftPredicate(MFunction.strictEquals(expected)),
						Option.map(
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
					)
				)
			);

	/**
	 * Returns the part of target that matches expected. If no match is found, returns a BadFormat error
	 * @category utils
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
				(z) => z,
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

interface BadFormatType extends BaseType {
	// Data received
	readonly actual: string;
	// Expected format
	readonly expected: string;
}

/**
 * General is to be used when nothing more specific matches
 * @category models
 */

export class General extends Data.TaggedError('BadArgumentGeneral')<GeneralType> {}

interface GeneralType extends BaseType {
	readonly message: string;
}
