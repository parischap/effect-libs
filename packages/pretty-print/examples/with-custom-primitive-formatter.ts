import { pipe } from 'effect';

import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPPrimitiveFormatter from '@parischap/pretty-print/PPPrimitiveFormatter';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const myFormatter = PPPrimitiveFormatter.utilInspectLikeMaker({
  id: 'TwoDecimalsAndShortStrings',
  // Strings are truncated at 30 characters with an ellipsis
  maxStringLength: 30,
  quoteChar: '"',
  // Numbers are formatted with two decimals and thousand separators
  numberFormatter: new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format,
  bigintFormatter: MString.fromNumber(10),
});

const { stringify } = pipe(
  PPParameters.darkModeUtilInspectLike,
  MStruct.append({
    id: 'WithCustomPrimitiveFormatter',
    primitiveFormatter: myFormatter,
  }),
  PPParameters.make,
  PPStringifier.make,
);

const toPrint = {
  price: 1_234_567.89,
  count: 42,
  ratio: 0.1,
  description: 'A very long description that will be truncated by the formatter',
  identifier: 1_234_567_890_123_456_789n,
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
