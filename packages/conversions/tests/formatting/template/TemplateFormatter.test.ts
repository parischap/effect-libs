import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateFormatter from '@parischap/conversions/CVTemplateFormatter';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import { MTypes } from '@parischap/effect-lib';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVTemplateFormatter', () => {
  const sep = CVTemplateSeparator;

  const templateParts = [
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
  ] as const;

  const templateFormatter1 = CVTemplateFormatter.fromTemplate(CVTemplate.make(...templateParts));
  const templateFormatter2 = CVTemplateFormatter.fromTemplateParts(...templateParts);

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof templateFormatter1,
      CVTemplateFormatter.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof templateFormatter2,
      CVTemplateFormatter.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplateFormatter.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        templateFormatter1.toString(),
        `#dd/#MM/#yyyy #MM formatter

#dd: 2-character string to 0-left-padded unsigned integer.
#MM: 2-character string to 0-left-padded unsigned integer.
#yyyy: 4-character string to 0-left-padded unsigned integer.
#MM: unsigned integer`,
      );
      TestUtils.strictEqual(
        templateFormatter2.toString(),
        `#dd/#MM/#yyyy #MM formatter

#dd: 2-character string to 0-left-padded unsigned integer.
#MM: 2-character string to 0-left-padded unsigned integer.
#yyyy: 4-character string to 0-left-padded unsigned integer.
#MM: unsigned integer`,
      );
    });
  });

  describe('format', () => {
    const formatter1 = CVTemplateFormatter.format(templateFormatter1);
    const formatter2 = CVTemplateFormatter.format(templateFormatter2);

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof formatter1,
        MTypes.OneArgFunction<
          {
            readonly dd: number;
            readonly MM: number;
            readonly yyyy: number;
          },
          Either.Either<string, MInputError.Type>
        >
      >(),
    );

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof formatter2,
        MTypes.OneArgFunction<
          {
            readonly dd: number;
            readonly MM: number;
            readonly yyyy: number;
          },
          Either.Either<string, MInputError.Type>
        >
      >(),
    );

    it('With correct values', () => {
      TestUtils.assertRight(
        formatter1({
          dd: 5,
          MM: 12,
          yyyy: 2025,
        }),
        '05/12/2025 12',
      );
      TestUtils.assertRight(
        formatter2({
          dd: 5,
          MM: 12,
          yyyy: 2025,
        }),
        '05/12/2025 12',
      );
    });

    it('With incorrect values', () => {
      TestUtils.assertLeftMessage(
        formatter1({
          dd: 115,
          MM: 12,
          yyyy: 2025,
        }),
        'Expected length of #dd to be: 2. Actual: 3',
      );
      TestUtils.assertLeftMessage(
        formatter2({
          dd: 115,
          MM: 12,
          yyyy: 2025,
        }),
        'Expected length of #dd to be: 2. Actual: 3',
      );
    });
  });
});
