import { PgClient } from '@effect/sql-pg';
import { Effect, Layer } from 'effect';

import * as ProgConfig from './ProgConfig.js';

/**
 * Provides both SqlClient.SqlClient and PgClient.PgClient. Manages pooled connections to the
 * database for all operations but migrations
 *
 * @category Layers
 */
export const live = PgClient.layerFrom(
  Effect.gen(function* () {
    const { dbHost, dbPort, dbName, dbUser, dbUserPassword, dbMaxConnections } =
      yield* ProgConfig.Service;
    return yield* PgClient.make({
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      password: dbUserPassword,
      maxConnections: dbMaxConnections,
    });
  }),
).pipe(Layer.withSpan('Creating pool database client'));

/**
 * Provides both SqlClient.SqlClient and PgClient.PgClient. Manages single connection to the
 * database for all operations but migrations. Use for scripts (seeding, one-off jobs...) that rely
 * on session state (`SET`, advisory locks, temporary tables). It's the same as using `sql.reserve`,
 * but allows using literal interpolation. If only a few statements need to run within the same
 * connection, use `sql.reserve` with `live` Layer.
 *
 * @category Layers
 */
export const liveOneConnection = PgClient.layerFrom(
  Effect.gen(function* () {
    const { dbHost, dbPort, dbName, dbUser, dbUserPassword } = yield* ProgConfig.Service;
    return yield* PgClient.makeClient({
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      password: dbUserPassword,
    });
  }),
).pipe(Layer.withSpan('Creating single-connexion database client'));

export const liveMigration = PgClient.layerFrom(
  Effect.gen(function* () {
    const { dbHost, dbPort, dbName, dbMigrationUser, dbMigrationUserPassword } =
      yield* ProgConfig.Service;
    return yield* PgClient.makeClient({
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbMigrationUser,
      password: dbMigrationUserPassword,
    });
  }),
).pipe(Layer.withSpan('Creating migration database client'));
