import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { HashMap, pipe } from 'effect';

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
