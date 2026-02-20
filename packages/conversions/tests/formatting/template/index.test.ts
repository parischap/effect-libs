import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
  const sep = CVTemplateSeparator;

  const template = CVTemplate.make(
    CVTemplatePlaceholder.number({
      name: 'dd',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.slash,
    CVTemplatePlaceholder.number({
      name: 'MM',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.slash,
    CVTemplatePlaceholder.number({
      name: 'yyyy',
      numberBase10Format: CVNumberBase10Format.fourDigitUnsignedInteger,
    }),
    sep.space,
    CVTemplatePlaceholder.number({
      name: 'MM',
      numberBase10Format: CVNumberBase10Format.unsignedInteger,
    }),
  );

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof template,
      CVTemplate.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplate.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
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
