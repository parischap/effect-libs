import { Effect, References, Tracer, pipe, Context, Layer } from 'effect';

import * as ProgConfig from './ProgConfig.js';

/** Layer that sets effect settings */
export const live = Layer.effectContext(
  Effect.gen(function* () {
    const { minLogLevel, activateTraces } = yield* ProgConfig.Service;

    return pipe(
      Context.make(References.MinimumLogLevel, minLogLevel),
      Context.add(References.CurrentLogLevel, 'Debug'),
      Context.add(Tracer.CurrentTraceLevel, 'Debug'),
      Context.add(References.TracerEnabled, activateTraces),
    );
  }),
);
