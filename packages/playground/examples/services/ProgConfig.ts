import { NodeServices } from '@effect/platform-node';
import { Config, ConfigProvider, Effect, FileSystem, Layer } from 'effect';

// Named `Service`, like any other service export (see `requirements-management.md`), even
// though this is not built with `Context.Service`
export const Service = Config.all({
  /* Maximal number of `Fiber`'s allowed to run concurrently in one operation */
  maxConcurrencyNumber: Config.Finite('MAX_CONCURRENCY_NUMBER').pipe(Config.withDefault(10)),
  /* Minimum log level */
  minLogLevel: Config.LogLevel('MIN_LOG_LEVEL').pipe(Config.withDefault('Info')),
  /* Whether to activate tracing */
  activateTraces: Config.Boolean('ACTIVATE_TRACES').pipe(Config.withDefault(false)),
  // Other configurations
  // ...
});

// Returns a `Layer<never, ...>`: `ConfigProvider` is a `Context.Reference`
export const layer = ConfigProvider.layer(
  Effect.gen(function* () {
    const { readFileString } = yield* FileSystem.FileSystem;
    /**
     * Read config from a `settings.env` file. If there is no such file, e.g. in dev, default values
     * are used (so always define some)
     */
    const settings = yield* readFileString('./settings.env', 'utf8').pipe(
      Effect.catchReason('PlatformError', 'NotFound', () => Effect.succeed('')),
    );
    return ConfigProvider.fromDotEnvContents(settings);
  }),
);

// Satisfies `Config.layer`'s `FileSystem` requirement
export const live = Layer.provide(layer, NodeServices.layer);

// Fixed values for tests, keyed by the same field names as passed to `Config.all` (no case conversion, as
// happens with environment variables)
export const test = ConfigProvider.layer(
  ConfigProvider.fromUnknown({ maxConcurrencyNumber: 10, minLogLevel: 'Info' }),
);
