import process, { getActiveResourcesInfo } from 'node:process';

import { NodeRuntime } from '@effect/platform-node';
import { Array, Cause, Console, Effect, Exit, HashSet, pipe, Runtime } from 'effect';

import * as Db from './internal/services/Db.js';
import * as DbMigration from './internal/services/DbMigration.js';
import * as DevTools from './internal/services/DevTools.js';
import * as LoggingAndTracing from './internal/services/LoggingAndTracing.js';
import * as ProgConfig from './internal/services/ProgConfig.js';
import * as SchemaCompilation from './internal/services/SchemaCompilation.js';

// Log uncaught exceptions. Note that, with a listener, Node.js no longer exits on an uncaught exception
process.on('uncaughtException', (error, origin) => {
  console.error(`${origin}: ${error.message}`);
});

// stdin, stdout and stderr are not leaks
const stdioResources = HashSet.make('TTYWrap', 'PipeWrap');

// Custom teardown to log unhandled errors and check the eventloop is empty
const teardown: Runtime.Teardown = (exit, onExit) => {
  if (Exit.isFailure(exit)) console.error(Cause.pretty(exit.cause));

  const activeResources = pipe(
    getActiveResourcesInfo(),
    Array.filter((name) => !HashSet.has(stdioResources, name)),
  );
  if (activeResources.length > 0)
    console.error(`Resources still active at teardown: ${Array.join(activeResources, ', ')}`);

  Runtime.defaultTeardown(exit, onExit);
};

// Url of the entry point
const entryURL = new URL(import.meta.url);

// Simulate a program
const program = Effect.gen(function* () {
  yield* Console.log('Start');
  yield* Console.log('End');
});

const runnable = pipe(
  program,
  Effect.provide([Db.live, DbMigration.live]),
  // oxlint-disable-next-line effecttsgo/multiple-effect-provide
  Effect.provide(SchemaCompilation.live(entryURL)),
  Effect.provide(LoggingAndTracing.live),
  Effect.provide(ProgConfig.live),
  Effect.provide(DevTools.live),
  Effect.withSpan('Main'),
);

/*const runnable
  Effect.provide(ProgConfig.live),*/

NodeRuntime.runMain(runnable, { teardown });
