import * as PPOption from '@parischap/pretty-print/PPOption'
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue'
import {pipe} from 'effect'
import * as HashMap from 'effect/HashMap'

const stringifier = PPOption.toStringifier(PPOption.darkModeTreeifyHideLeaves);

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

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
