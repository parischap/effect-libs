import { NodeFileSystem, NodePath, NodeChildProcessSpawner } from '@effect/platform-node';
import { PgMigrator } from '@effect/sql-pg';
import { Layer } from 'effect';
import { Migrator } from 'effect/sql';

import * as Db from './Db.js';

export const layer = PgMigrator.layer({
  // This is not a constant, I could have imported them statically one by one
  loader: Migrator.fromGlob(import.meta.glob('../migrations/*.ts')),
}).pipe(Layer.withSpan('Apply migrations'));

export const live = Layer.provide(layer, [
  NodeFileSystem.layer,
  NodePath.layer,
  NodeChildProcessSpawner.layer,
  Db.liveMigration,
]);
