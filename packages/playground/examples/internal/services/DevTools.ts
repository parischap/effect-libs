import { Effect, pipe, Layer } from 'effect';

import * as Pop from '../errors/Pop.js';

/**
 * Layer that loads the Devtools' Layer in dev only
 *
 * @category Layers
 */
export const live = (
  import.meta.env?.PROD === true
    ? Layer.empty
    : pipe(
        Effect.tryPromise(() => import('effect/devtools')),
        Effect.map((DevTools) => DevTools.DevTools.layer()),
        Effect.catch(
          (e) => new Pop.Type({ originalError: e, message: "'effect/devtools' not found" }),
        ),
        Layer.unwrap,
      )
).pipe(Layer.withSpan('Connection to DevTools'));
