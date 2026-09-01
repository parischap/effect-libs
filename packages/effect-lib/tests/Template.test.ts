import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MTemplate from '@parischap/effect-lib/MTemplate';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

describe('MTemplate', () => {
  const sep = MTemplateSeparator;

  const template = MTemplate.make(
    MTemplatePlaceholder.number({
      name: 'dd',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.slash,
    MTemplatePlaceholder.number({
      name: 'MM',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.slash,
    MTemplatePlaceholder.number({
      name: 'yyyy',
      numberBase10Format: MNumberBase10Format.fourDigitUnsignedInteger,
    }),
    sep.space,
    MTemplatePlaceholder.number({
      name: 'MM',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
  );

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof template,
      MTemplate.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTemplate.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      assert.strictEqual(
        template.toString(),
        `#dd/#MM/#yyyy #MM

#dd: 2-character string to 0-left-padded unsigned integer.
#MM: 2-character string to 0-left-padded unsigned integer.
#yyyy: 4-character string to 0-left-padded unsigned integer.
#MM: unsigned integer`,
      );
    });
  });
});
