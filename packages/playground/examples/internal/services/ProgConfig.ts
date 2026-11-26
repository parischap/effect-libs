import { NodeFileSystem } from '@effect/platform-node';
import { Config, ConfigProvider, Effect, FileSystem, Layer, Redacted } from 'effect';

import * as Constants from './Constants.js';

/**
 * Configuration service
 *
 * @category Services
 */
export const Service = Config.all({
  /** Maximal number of `Fiber`'s allowed to run concurrently in one operation */
  maxConcurrencyNumber: Config.Finite('MAX_CONCURRENCY_NUMBER').pipe(Config.withDefault(10)),
  /** Minimum log level, under which `Effect.log*` is a no-op */
  minLogLevel: Config.LogLevel('MIN_LOG_LEVEL').pipe(Config.withDefault('Info')),
  /**
   * Logging uses a mixture of effect logging and tracing:
   *
   * - `DefaultTracing`: Default effect tracer. In dev, you can use DevTools vscode extension to view
   *   traces, which contain logs as events.
   * - 'ConsoleLogging', 'TxtLogging', 'JsonLogging': a custom tracer is setup that logs trace starts,
   *   trace ends and trace events. Depending on the value, it logs to the console, to a txt or to a
   *   JSON file.
   * - 'None': Tracing and logging are deactivated.
   */
  loggingMode: Config.Literals(
    ['None', 'ConsoleLogging', 'TxtLogging', 'JsonLogging', 'DefaultTracing'],
    'LOGGING_MODE',
  ).pipe(Config.withDefault('DefaultTracing')),

  // Only if the program uses a `pg` database
  /** Host */
  dbHost: Config.String('DB_HOST').pipe(Config.withDefault('127.0.0.1')),
  /** Port */
  dbPort: Config.Finite('DB_PORT').pipe(Config.withDefault(5432)),
  /** Database name: we may want to try the dev Database in a prod environment */
  dbName: Config.String('DB_NAME').pipe(Config.withDefault('dev')),
  /** Database user for all operations but migrations */
  dbUser: Config.String('DB_USER').pipe(Config.withDefault('dev')),
  /** Password of `dbUser` for all operations but migrations */
  dbUserPassword: Config.Redacted('DB_USER_PASSWORD').pipe(
    Config.withDefault(Redacted.make('dev')),
  ),
  /** Database user for migrations only */
  dbMigrationUser: Config.String('DB_MIGRATION_USER').pipe(Config.withDefault('migration')),
  /** Password of `dbMigrationUser` */
  dbMigrationUserPassword: Config.Redacted('DB_MIGRATION_USER_PASSWORD').pipe(
    Config.withDefault(Redacted.make('migration')),
  ),
  /** Maximal number of connexions to the database */
  dbMaxConnections: Config.Finite('DB_MAX_CONNECTIONS').pipe(Config.withDefault(10)),

  // Only if the program uses a `pglite` database
  /** Db path expressed relatively to `pgRoot` */
  dbPath: Config.String('DB_PATH').pipe(Config.withDefault('.')),

  // Other configurations
  // ...
});

/**
 * Configuration layer
 *
 * @category Layers
 */
export const layer = ConfigProvider.layer(
  Effect.gen(function* () {
    const { readFileString } = yield* FileSystem.FileSystem;
    const { settingsPath } = yield* Constants.Service;

    /**
     * Read config from a `settings.env` file. If there is no such file, e.g. in dev, default values
     * are used (so always define some for values used in the dev environment)
     */
    const settings = yield* readFileString(settingsPath, 'utf8').pipe(
      Effect.catchReason('PlatformError', 'NotFound', () => Effect.succeed('')),
    );
    return ConfigProvider.fromDotEnvContents(settings);
  }),
);

/**
 * Runnable configuration layer
 *
 * @category Layers
 */
export const live = Layer.provide(layer, [NodeFileSystem.layer, Constants.Service.live]);

// Databases are not accessed in test env: all requests return fixed values => Db configuration needs not be mocked
/**
 * Test configuration layer. These values must not change so tests always happen in the same
 * environment
 *
 * @category Layers
 */
export const test = ConfigProvider.layer(
  ConfigProvider.fromUnknown({
    maxConcurrencyNumber: 10,
    minLogLevel: 'Info',
    activateTraces: false,
  }),
);
