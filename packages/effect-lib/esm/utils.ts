/**
 * This package exports functions that are not linked to a particular type
 *
 * @since 0.5.0
 */
import { Array, flow, Option, String, Tuple } from 'effect';
import * as MArray from './Array.js';
import * as MRegExp from './RegExp.js';
import * as MString from './String.js';
import * as MTuple from './Tuple.js';
import * as MTypes from './types.js';

/**
 * Function that deduces the module name from the position of a test file. Used to check the
 * moduleTag.
 *
 * @since 0.5.0
 * @category Utils
 */
export const moduleTagFromFileName: MTypes.OneArgFunction<string, string | null> = flow(
	String.split(MRegExp.universalPathSep),
	MTuple.makeBothBy({ toFirst: MArray.getFromEnd(2), toSecond: MArray.getFromEnd(0) }),
	Option.all,
	Option.map(
		flow(
			Tuple.mapSecond(MString.takeLeftTo('.')),
			MTuple.prependElement('@parischap'),
			Array.join('/'),
			MString.append('/')
		)
	),
	Option.getOrElse(() => null)
);
