import type { Fiber } from 'effect';
import { Effect, Duration, Console } from 'effect';

// The Effect we want to run asynchronously
const show = (text: string, waitInSecs: number): Effect.Effect<void, Error> =>
  text === ''
    ? Effect.fail(new Error('Bad argument'))
    : Effect.gen(function* () {
        // Waits `waitInSecs` seconds
        yield* Effect.sleep(Duration.seconds(waitInSecs));
        // Shows `text`
        yield* Console.log(text);
      });

const program = Effect.gen(function* () {
  // fiber1 is a handle to a fiber that executes our first show Effect
  const fiber1: Fiber.Fiber<number, Error> = yield* Effect.forkChild(show('Hello', 3));
  // fiber2 is a handle to a fiber that executes our second show Effect
  const fiber2: Fiber.Fiber<number, Error> = yield* Effect.forkChild(show('Bye', 5));
  // Wait 10 seconds
  yield* Effect.sleep(Duration.seconds(10));
});

const result = Effect.runPromiseExit(program);
