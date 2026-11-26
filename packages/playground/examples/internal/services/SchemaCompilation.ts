import { NodePath } from '@effect/platform-node';
import { Effect, pipe, Path, Layer } from 'effect';

import * as Constants from './Constants.js';

/**
 * Layer that loads precompiled `Schema`'s in prod and enables `Schema` JIT compilation in dev
 *
 * @category Layers
 */
export const layer = (entryModuleUrl: URL) =>
  Layer.effectDiscard(
    Effect.gen(function* () {
      const { fromFileUrl, join, relative } = yield* Path.Path;
      const { compiledSchemasRelativePath } = yield* Constants.Service;
      const entryModulePath = yield* fromFileUrl(entryModuleUrl);
      const currentModulePath = yield* fromFileUrl(new URL(entryModuleUrl));
      const compiledSchemasPath = join(
        relative(currentModulePath, entryModulePath),
        compiledSchemasRelativePath,
      );

      // Tries to load compiled `Schema`'s. We do it also in dev in case we need to debug with compiled `Schema`'s
      return yield* pipe(
        Effect.tryPromise(() => import(compiledSchemasPath)),
        Effect.catch(() =>
          Effect.gen(function* () {
            yield* Effect.logWarning(
              `Error loading ${join(entryModulePath, compiledSchemasRelativePath)}: no Schema compilation`,
            );

            // Enable JIT Schema compilation
            yield* pipe(
              Effect.tryPromise(() => import('effect/schema/SchemaJITCompiler/enable')),
              Effect.catch(() =>
                Effect.logWarning(
                  "'effect/schema/SchemaJITCompiler/enable' could not be found: no Schema compilation",
                ),
              ),
            );
          }),
        ),
      );
    }),
  ).pipe(Layer.withSpan("Managing schemas' compilation"));

export const live = (entryModuleUrl: URL) =>
  Layer.provide(layer(entryModuleUrl), [NodePath.layer, Constants.Service.live]);
