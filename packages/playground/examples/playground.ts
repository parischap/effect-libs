import { NodeRuntime } from '@effect/platform-node';
import { Deferred, Effect } from 'effect';

const program = Effect.gen(function* () {
  yield* Effect.die('boom');
  const deferred = yield* Deferred.make<number>();
  const success = yield* Deferred.succeed(deferred, 4);
  const value = yield* Deferred.await(deferred);
  console.log(value);
  console.log(success);
});

NodeRuntime.runMain(program);
