import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeTreeifyHideLeaves);

const toPrint = {
  A: {
    A1: {
      A11: null,
      A12: [{ A121: null, A122: null, A123: null }, { A124: null }],
      A13: null,
    },
    A2: null,
    A3: null,
  },
  B: HashMap.make(['B1', null], ['B2', null]),
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
