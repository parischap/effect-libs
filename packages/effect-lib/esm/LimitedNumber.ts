import { Number, Struct, pipe } from 'effect';

class Under {
	constructor(
		readonly value: number,
		readonly limit: number
	) {}
}

/**
 * Numbers under a limit
 * @category models
 */
export { type Under };

class Over {
	constructor(
		readonly value: number,
		readonly limit: number
	) {}
}

/**
 * Numbers over a limit
 * @category models
 */
export { type Over };

class Equal {
	constructor(
		readonly value: number,
		readonly limit: number
	) {}
}

/**
 * Numbers equal to a limit
 * @category models
 */
export { type Equal };

/**
 * Numbers under, at or over a limit
 * @category models
 */
export type Type = Under | Over | Equal;

/**
 * @category constructors
 */
export const make =
	(limit: number) =>
	(n: number): Type =>
		n > limit ? new Over(n, limit)
		: n < limit ? new Under(n, limit)
		: new Equal(n, limit);

/**
 * @category type guards
 */
export const isOver = (n: Type): n is Over => n instanceof Over;

/**
 * @category type guards
 */
export const isUnder = (n: Type): n is Under => n instanceof Under;

/**
 * @category type guards
 */
export const isEqual = (n: Type): n is Equal => n instanceof Equal;

/**
 * @category constructors
 */
export const copy = (self: Type): Type => make(self.limit)(self.value);

/**
 * @category utils
 */
export const sum =
	(that: number) =>
	(self: Type): Type =>
		pipe(self, Struct.evolve({ value: Number.sum(that) }), copy);

/**
 * @category utils
 */
export const multiply =
	(that: number) =>
	(self: Type): Type =>
		pipe(self, Struct.evolve({ value: Number.multiply(that) }), copy);
