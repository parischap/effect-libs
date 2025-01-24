/**
 * Type that represents the properties of a record in their stringification context. It is in fact
 * an alias for an array of Value's (see Value.ts)
 */

import { MArray, MFunction, MPredicate, MTuple, MTypes } from '@parischap/effect-lib';
import { Array, flow, Number, Option, pipe, Predicate } from 'effect';
import * as PPOption from './Option.js';
import * as PPValue from './Value.js';

/**
 * Type that represents the properties of a record
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPValue.All> {}

/**
 * Returns a function that takes a Value.NonPrimitiveType and returns a Value.All for each of its
 * own and inherited (from the prototypes) properties. Stops when option.maxPrototypeDepth is
 * reached and applies option.propertyFilter
 *
 * @category Utils
 */
export const fromRecord = (
	option: PPOption.Type
): MTypes.OneArgFunction<PPValue.NonPrimitiveType, Type> =>
	flow(
		PPValue.incDepth,
		PPValue.resetProtoDepth,
		MArray.unfoldNonEmpty(
			MTuple.makeBothBy({
				toFirst: (record) => {
					const valueFromKey = PPValue.toRecordPropertyBuilder(record);
					return pipe(
						record.value,
						// Record.map will not return all keys
						Reflect.ownKeys,
						Array.map(valueFromKey)
					);
				},
				toSecond: flow(
					PPValue.toProto,
					PPValue.incProtoDepth,
					Option.liftPredicate(
						MPredicate.struct({
							protoDepth: Number.lessThanOrEqualTo(option.maxPrototypeDepth)
						})
					),
					Option.filter(PPValue.isNotNull)
				)
			})
		),
		Array.flatten,
		// Removes __proto__ properties if there are some because we have already read that property with getPrototypeOf
		Array.filter(
			MPredicate.struct({ stringKey: Predicate.not(MFunction.strictEquals('__proto__')) })
		),
		option.propertyFilter
	);
