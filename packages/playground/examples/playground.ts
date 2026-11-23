import { NodeRuntime } from '@effect/platform-node';
import { Console, Effect } from 'effect';

import * as Db from './internal/services/Db.js';
import * as DbMigration from './internal/services/DbMigration.js';
import * as DevTools from './internal/services/DevTools.js';
import * as LoggingAndTracing from './internal/services/LoggingAndTracing.js';
import * as ProgConfig from './internal/services/ProgConfig.js';
import * as SchemaCompilation from './internal/services/SchemaCompilation.js';

// Url of the entry point
const entryURL = new URL(import.meta.url);

// Simulate a program
const program = Effect.gen(function* () {
  yield* Console.log('Start');
  yield* Console.log('End');
});

const runnable = Effect.provide(program, [
  Db.live,
  DbMigration.live,
  SchemaCompilation.live(entryURL),
  DevTools.live,
  LoggingAndTracing.live,
  ProgConfig.live,
]);

/*const runnable
  Effect.provide(ProgConfig.live),*/

NodeRuntime.runMain(runnable);

