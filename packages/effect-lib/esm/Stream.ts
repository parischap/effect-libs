import {
	Array,
	Chunk,
	Data,
	Effect,
	Number,
	Option,
	Stream,
	Struct,
	Tuple,
	flow,
	pipe
} from 'effect';
import * as MFunction from './Function.js';

export class StreamContentError extends Data.TaggedError('StreamContentError')<{
	readonly message: string;
}> {}

export const ExtractNBytes =
	(n: number) =>
	<E>(
		self: Stream.Stream<Uint8Array, E>
	): Effect.Effect<
		[iv: Uint8Array, remainingStream: Stream.Stream<Uint8Array, E>],
		E | StreamContentError
	> =>
		Effect.gen(function* () {
			const ivConstituents = yield* pipe(
				pipe(
					self,
					Stream.map((a) => a.length),
					Stream.scan(0, (z, a) => z + a),
					Stream.drop(1),
					Stream.takeUntil((a) => a >= n),
					Stream.zip(self),
					Stream.map(([_, a]) => Array.fromIterable(a)),
					Stream.runCollect
				)
			);

			const [iv, leftOver] = yield* pipe(
				ivConstituents,
				Array.fromIterable,
				Array.flatten,
				Array.splitAt(n),
				MFunction.filter(
					flow(
						Option.liftPredicate(flow(Struct.get('length'), Number.greaterThanOrEqualTo(n))),
						Option.map(
							() =>
								new StreamContentError({
									message:
										'IV vector could not be extracted. Stream must contain at least 16 bytes.'
								})
						)
					)
				)
			);

			return Tuple.make(
				new Uint8Array(iv),
				pipe(
					self,
					Stream.drop(ivConstituents.length),
					Stream.prepend(Chunk.of(new Uint8Array(leftOver)))
				)
			);
		});
