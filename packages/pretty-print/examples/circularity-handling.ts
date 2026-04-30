import { pipe } from 'effect';

import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = pipe(
  PPParameters.utilInspectLike,
  MStruct.append({
    id: 'UtilInspectLikeInfiniteDepth',
    maxDepth: +Infinity,
  }),
  PPParameters.make,
  PPStringifier.make,
);

const circular: Record<string, unknown> = { a: 1, b: { inner: 1, circular: 1 } };
(circular['b'] as Record<string, unknown>)['inner'] = circular['b'];
(circular['b'] as Record<string, unknown>)['circular'] = circular;
circular['a'] = [circular];

console.log(pipe(circular, stringify, PPStringifiedValue.toAnsiString()));
