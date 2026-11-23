import { type Config, Data, Effect } from 'effect';

import * as ProgConfig from '../services/ProgConfig.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/my-app/internal/errors/Pop/';

/**
 * Type of an error that cannot be handled by the program (it will stop the program and pop to the
 * system)
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
  readonly originalError: unknown;
  readonly message: string;
}> {}

export const make = Effect.fn('Pop.make')(
  // Use `Effect.fn.Return` to specify return type (accepts same type params as `Effect.Effect`).
  function* ({
    originalError,
    message,
  }: {
    readonly originalError: unknown;
    readonly message: string;
  }): Effect.fn.Return<Type, Config.ConfigError> {
    const { isProd } = yield* ProgConfig.Service;

    return new Type({ originalError, message });
  },
);
