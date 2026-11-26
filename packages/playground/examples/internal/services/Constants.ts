import { NodePath } from '@effect/platform-node';
import { Context, Effect, Layer, Path } from 'effect';
import { UserDirectories } from 'effect/persistence';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/my-app/internal/services/Constants/';

const progName = 'foo';

/**
 * Constants' service
 *
 * @category Services
 */
export class Service extends Context.Service<
  Service,
  {
    /** Name of the program being executed */
    readonly progName: string;
    /** Path to the configuration file */
    readonly settingsPath: string;
    /** Path to the txt log file */
    readonly txtLogFilePath: string;
    /** Path to the JSON log file */
    readonly jsonLogFilePath: string;
    /** Path to the compiled `Schema`'s, expressed relatively to the entry module */
    readonly compiledSchemasRelativePath: string;
  }
>()(moduleTag) {
  /** Constants' Layer */
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function* () {
      const { config, state } = yield* UserDirectories.UserDirectories;
      const { join } = yield* Path.Path;

      const configPath = yield* config(progName);
      const statePath = yield* state(progName);

      return {
        progName,
        settingsPath: join(configPath, 'settings.env'),
        txtLogFilePath: join(statePath, 'logs.txt'),
        jsonLogFilePath: join(statePath, 'logs.json'),
        compiledSchemasRelativePath: './schema-aot.js',
      };
    }),
  );
  /** Runnable constants' layer */
  static readonly live = Layer.provide(this.layer, [NodePath.layer, UserDirectories.layer]);
  /** `Layer` to use in tests. Values must not change so tests are reproducible */
  static readonly test = Layer.succeed(this, {
    progName,
    // Not used in tests
    settingsPath: '',
    // Not used in tests
    compiledSchemasRelativePath: '',
    // Not used in tests
    txtLogFilePath: '',
    // Not used in tests
    jsonLogFilePath: '',
  });
}
