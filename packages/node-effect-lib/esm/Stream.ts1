import { BinaryLike, CipherKey, createDecipheriv } from 'crypto';
import { Effect, Stream, pipe } from 'effect';

/**
 * ATTENTION: ReadableStream as defined in javascript for the browser is not the same as stream.Readable as defined in nodejs. Same for WritableStream. The Effect.fromReadableStream method refers to a web ReadableStream
 */

const moduleTag = '@mjljm/node-effect-lib/NStream/';

export const feedWritableStream =
	<A>(s: WritableStream<A>) =>
	<R, E>(self: Stream.Stream<A, E, R>): Effect.Effect<void, E, R> =>
		pipe(
			Effect.acquireRelease(
				Effect.sync(() => s.getWriter()),
				(writer) =>
					Effect.andThen(
						Effect.promise(() => writer.ready),
						Effect.promise(() => writer.close())
					)
			),
			Effect.flatMap((writer) =>
				pipe(
					self,
					Stream.runForEach((a) =>
						Effect.andThen(
							Effect.promise(() => writer.ready),
							Effect.promise(() => writer.write(a))
						)
					)
				)
			),
			Effect.scoped
		);

export const decipheriv =
	(algorithm: string, key: CipherKey, iv: BinaryLike | null) =>
	<R, E>(self: Stream.Stream<R, E, Uint8Array>): Stream.Stream<R, E | MFunctionPortError.Type, Uint8Array> =>
		Stream.unwrap(
			Effect.gen(function* (_) {
				const decipher = yield* _(
					Effect.try({
						try: () => createDecipheriv(algorithm, key, iv),
						catch: (error) =>
							new MFunctionPortError.Type({
								originalError: error,
								originalFunctionName: 'crypto.createDecipheriv',
								moduleName: moduleTag,
								libraryName: 'node-effect-lib'
							})
					})
				);
				const decipheredStream = Stream.fromReadableStream<Uint8Array, MFunctionPortError.Type>(
					() => decipher,
					(error) =>
						new MFunctionPortError.Type({
							originalError: error,
							originalFunctionName: 'crypto.createDecipheriv.getReader',
							moduleName: moduleTag,
							libraryName: 'node-effect-lib'
						})
				);

				const essai = Stream.asyncInterrupt<never, MFunctionPortError.Type, [eventType: string, filename: string]>((emit) => {
					while ()
	
					watcher.on('change', (eventType, filename) => void emit.single([eventType, filename as string]));
					watcher.on(
						'error',
						(error) =>
							void emit.die(
								new MFunctionPortError.Type({
									originalError: error,
									originalFunctionName: 'fs.watch',
									moduleName: moduleTag,
									libraryName: 'node-effect-lib'
								})
							)
					);
					watcher.on('close', () => void emit.end());
	
					return Either.left(Effect.succeed(watcher.close()));
				});
				return decipheredStream;
			})
		) as never;