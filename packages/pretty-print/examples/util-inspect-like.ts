import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeUtilInspectLike);

const toPrint = {
  a: [7, 8],
  e: HashMap.make(['key1', 3], ['key2', 6]),
  b: { a: 5, c: 8 },
  f: Math.max,
  d: {
    e: true,
    f: { a: { k: { z: 'foo', y: 'bar' } } },
  },
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
