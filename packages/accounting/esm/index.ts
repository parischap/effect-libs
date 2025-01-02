*import * as GlobalConfig from '@parischap/package-manager/GlobalConfig';
import * as GlobalConstants from '@parischap/package-manager/GlobalConstants';
import * as MonoRepo from '@parischap/package-manager/MonoRepo';
import * as PrettyPrint from '@parischap/effect-pretty-print';
import { RLogger, REffect, RUtils } from '@parischap/effect-report';
import { NPath } from '@parischap/node-effect-lib';
import { Effect, Layer, Logger, pipe } from 'effect';
import { DevTools } from "@effect/experimental"

const startTime = new Date().getTime();
console.log('Program started');

const stringify = (u: unknown) => PrettyPrint.stringify(u, PrettyPrint.Options.ansi).value;

//******************** CREATING LAYERS ***************************************/

const live = pipe(
	GlobalConstants.live,
	Layer.merge(GlobalConfig.live),
	Layer.merge(MonoRepo.live),
	Layer.merge(NPath.live)
);

//******************** MAIN PROGRAM ***************************************/

const program = Effect.gen(function* () {
	const globalConfig = yield* pipe(GlobalConfig.Service);
	const globalConstants = yield* pipe(GlobalConstants.Service);
	const nPath = yield* pipe(NPath.Service);

	RUtils.catchUnexpectedErrors({
		eol: globalConstants.eol,
		pathSep: nPath.sep,
		stringify,
		tabChar: globalConstants.tabChar
	});

	const ioLoggerLive = RLogger.live({
		eol: globalConstants.eol,
		startTime,
		stringify,
		tabChar: globalConstants.tabChar
	});

	return yield* pipe(
		Effect.gen(function* () {
			const monoRepo = yield* pipe(MonoRepo.Service);

			yield* pipe(globalConfig.showConfiguration);

			return yield* pipe(monoRepo.checkAndUpdate);
		}),
		Logger.withMinimumLogLevel(globalConfig.logLevel),
		REffect.presentAndShowErrors({
			eol: globalConstants.eol,
			message: 'Starting effect fiber',
			pathSep: nPath.sep,
			stringify,
			tabChar: globalConstants.tabChar,
			thisProgramPath: globalConfig.thisProgramPath
		}),
		Effect.provide(ioLoggerLive)
	);
});

await Effect.runPromise(pipe(program, Effect.provide(live)));