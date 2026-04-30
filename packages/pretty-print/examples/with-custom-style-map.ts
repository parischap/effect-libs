import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASPalette from '@parischap/ansi-styles/ASPalette';
import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';
import * as PPStyle from '@parischap/pretty-print/PPStyle';
import * as PPStyleMap from '@parischap/pretty-print/PPStyleMap';

const customStyleMap = PPStyleMap.make({
  id: 'CustomStyleMap',
  styles: HashMap.make(
    [
      'NonPrimitiveValueMarks',
      PPStyle.makeDepthIndexed(
        ASPalette.make(ASStyle.magenta, ASStyle.cyan, ASStyle.yellow, ASStyle.green),
      ),
    ] as const,
    [
      'PrimitiveValue',
      PPStyle.makeTypeIndexed(
        ASPalette.make(
          ASStyle.green,
          ASStyle.brightYellow,
          ASStyle.brightYellow,
          ASStyle.brightCyan,
          ASStyle.magenta,
          ASStyle.brightRed,
          ASStyle.brightBlack,
        ),
      ),
    ] as const,
    ['PropertyKey', ASContextStyler.white] as const,
    ['KeyValueSeparator', ASContextStyler.white] as const,
    ['InBetweenPropertySeparator', ASContextStyler.white] as const,
  ),
});

const { stringify } = pipe(
  PPParameters.darkModeUtilInspectLike,
  MStruct.append({
    id: 'WithCustomStyleMap',
    styleMap: customStyleMap,
  }),
  PPParameters.make,
  PPStringifier.make,
);

const toPrint = {
  name: 'parischap',
  age: 30,
  active: true,
  tags: ['effect', 'typescript'],
  nested: {
    inner: {
      deep: 'hello',
    },
  },
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
