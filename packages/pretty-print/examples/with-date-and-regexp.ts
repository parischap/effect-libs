import { pipe } from 'effect';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeUtilInspectLike);

const toPrint = {
  createdAt: new Date(0),
  updatedAt: new Date('2026-04-30T10:00:00Z'),
  emailPattern: /^[\w.+-]+@[\w-]+\.[\w.-]+$/i,
  ids: [/^abc/, /xyz$/g],
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
