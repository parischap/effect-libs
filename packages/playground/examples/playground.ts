import { NodeRuntime } from '@effect/platform-node';
import { Effect } from 'effect';
import { DevTools } from 'effect/unstable/devtools';

const program = Effect.log('Hello!').pipe(
  Effect.delay(2000),
  Effect.withSpan('Hi', { attributes: { foo: 'bar' } }),
  Effect.forever,
);
const DevToolsLive = DevTools.layer();

program.pipe(Effect.provide(DevToolsLive), NodeRuntime.runMain);
