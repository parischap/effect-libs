import { pipe } from 'effect';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeTreeify);

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

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
