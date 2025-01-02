import { MFs } from '@parischap/effect-lib';
import { JsANSI } from '@parischap/js-lib';
import { Effect, pipe } from 'effect';
import * as MCause from './Cause.js';
import * as RErrors from './Errors.js';
import * as RLogger from './Logger.js';

export const presentAndWrapErrors =
	(message: string) =>
	<A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, never, R> =>
		pipe(
			self,
			Effect.tap(() => RLogger.logDebugTitle(message)),
			Effect.withLogSpan(message),
			Effect.catchAllCause((c) =>
				Effect.die(
					new RErrors.WithOriginalCause({
						message,
						originalCause: c
					})
				)
			)
		);

export const logIntermediateResult =
	(message: (s: string) => string) =>
	<A extends string, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
		Effect.andThen(self, (result) =>
			Effect.gen(function* () {
				yield* pipe(Effect.logDebug(''));
				yield* pipe(Effect.logDebug(message(result)));
				return result;
			})
		);

export const presentAndShowErrors =
	({
		eol,
		message,
		pathSep,
		stringify,
		tabChar,
		thisProgramPath
	}: {
		readonly eol: string;
		readonly message: string;
		readonly pathSep: string;
		readonly stringify: (u: unknown) => string;
		readonly tabChar: string;
		readonly thisProgramPath: MFs.Folderpath;
	}) =>
	<A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A | void, never, R> =>
		pipe(
			self,
			Effect.withLogSpan(message),
			Effect.catchAllCause((c) =>
				pipe(
					c,
					MCause.toString({
						eol,
						pathSep,
						stringify,
						tabChar,
						thisProgramPath
					}),
					(errorText) => {
						// Do not use Effect.log here because it has a special formatting
						if (errorText.trim() === '') {
							console.log(JsANSI.green('SCRIPT EXITED SUCCESSFULLY'));
						} else {
							console.error(JsANSI.red('SCRIPT FAILED WITH FOLLOWING ERROR(S)') + eol + errorText);
						}
						return Effect.void;
					}
				)
			)
		);
