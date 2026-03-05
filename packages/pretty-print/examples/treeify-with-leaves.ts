import { pipe } from 'effect';

import * as PPOption from '@parischap/pretty-print/PPOption';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';

const stringifier = PPOption.toStringifier(PPOption.darkModeTreeify);

const toPrint = {
  Vegetal: {
    Trees: {
      Oaks: 8,
      BirchTree: 3,
    },
    Fruit: { Apples: 8, Lemons: 5 },
  },
  Animal: {
    Mammals: {
      Dogs: 3,
      Cats: 2,
    },
  },
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
