import { Effect, pipe, Layer } from 'effect';

import * as ProgConfig from './ProgConfig.js';

/**
 * Layer that loads the Devtools' Layer in dev only
 *
 * @category Layers
 */
export const live = Layer.unwrap(
  Effect.gen(function* () {
    const { isProd } = yield* ProgConfig.Service;

    return isProd
      ? Layer.empty
      : yield* pipe(
          Effect.tryPromise(() => import('effect/devtools')),
          Effect.map((DevTools) => DevTools.DevTools.layer()),
          Effect.catch(() =>
            Effect.gen(function* () {
              yield* Effect.logWarning(
                "'effect/devtools' could not be found: no devTools assistance",
              );
              return Layer.empty;
            }),
          ),
        );
  }),
).pipe(Layer.withSpan('Connection to DevTools'));
