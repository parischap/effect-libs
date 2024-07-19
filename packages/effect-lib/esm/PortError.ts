import { Data } from 'effect';

/**
 * FunctionPort signals an error that occurs while Effectifying a function
 */
export class Type extends Data.TaggedError('FunctionPort')<{
	readonly originalError: unknown;
	readonly originalFunctionName: string;
	readonly moduleName: string;
	readonly libraryName: string;
}> {}
