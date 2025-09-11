#!/usr/bin/env node
/* eslint-disable functional/no-expression-statements */
import * as PPOption from '@parischap/pretty-print/PPOption';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);

const toPrint = {
	a: [7, 8],
	e: HashMap.make(['key1', 3], ['key2', 6]),
	b: { a: 5, c: 8 },
	f: Math.max,
	d: {
		e: true,
		f: { a: { k: { z: 'foo', y: 'bar' } } }
	}
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
