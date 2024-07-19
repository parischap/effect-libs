import { Context, Effect, Layer, Ref, Scope, pipe } from 'effect';
/**
 * Same as scope but pnly one finalizer can be added. Any addition of a finalizer after the initial one will be ignored.
 */
const moduleTag = '@parischap/effect-lib/Once/';

export interface ServiceInterface {
	readonly addFinalizer: (
		finalizer: Effect.Effect<unknown, never, never>
	) => Effect.Effect<void, never, never>;
}

export class Service extends Context.Tag(moduleTag + 'Service')<Service, ServiceInterface>() {}

export const layer = Layer.scoped(
	Service,
	Effect.gen(function* () {
		const addedRef = yield* pipe(Ref.make(false));
		const scope = yield* pipe(Scope.Scope);
		return {
			addFinalizer: (finalizer) =>
				Effect.gen(function* () {
					const added = yield* pipe(Ref.getAndUpdate(addedRef, () => true));
					if (!added) {
						yield* pipe(Scope.addFinalizer(scope, finalizer));
					}
				})
		};
	})
);

export const live = layer;
