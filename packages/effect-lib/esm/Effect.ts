import { Effect } from 'effect';

interface EffectPredicate<in Z, out E, out R> {
	(x: Z): Effect.Effect<boolean, E, R>;
}

export { type EffectPredicate as Predicate };
