import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVTemplateParser', () => {
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

  const templateParser1 = CVTemplateParser.fromTemplate(CVTemplate.make(...templateParts));
  const templateParser2 = CVTemplateParser.fromTemplateParts(...templateParts);

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof templateParser1,
      CVTemplateParser.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof templateParser2,
      CVTemplateParser.Type<{ readonly MM: number; readonly dd: number; readonly yyyy: number }>
    >(),
  );

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplateParser.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        templateParser1.toString(),
        `#dd/#MM/#yyyy #MM parser

#dd: 2-character string to 0-left-padded unsigned integer.
#MM: 2-character string to 0-left-padded unsigned integer.
#yyyy: 4-character string to 0-left-padded unsigned integer.
#MM: unsigned integer`,
      );
      TestUtils.strictEqual(
        templateParser2.toString(),
        `#dd/#MM/#yyyy #MM parser

#dd: 2-character string to 0-left-padded unsigned integer.
#MM: 2-character string to 0-left-padded unsigned integer.
#yyyy: 4-character string to 0-left-padded unsigned integer.
#MM: unsigned integer`,
      );
    });
  });

  describe('parse', () => {
    const parser1 = CVTemplateParser.parse(templateParser1);
    const parser2 = CVTemplateParser.parse(templateParser2);

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof parser1,
        (
          text: string,
        ) => Either.Either<
          { readonly MM: number; readonly dd: number; readonly yyyy: number },
          MInputError.Type
        >
      >(),
    );

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof parser2,
        (
          text: string,
        ) => Either.Either<
          { readonly MM: number; readonly dd: number; readonly yyyy: number },
          MInputError.Type
        >
      >(),
    );

    it('Empty text', () => {
      TestUtils.assertLeftMessage(parser1(''), 'Expected length of #dd to be: 2. Actual: 0');
      TestUtils.assertLeftMessage(parser2(''), 'Expected length of #dd to be: 2. Actual: 0');
    });

    it('Text too short', () => {
      TestUtils.assertLeftMessage(
        parser1('25/12'),
        "Expected remaining text for separator at position 4 to start with '/'. Actual: ''",
      );
      TestUtils.assertLeftMessage(
        parser2('25/12'),
        "Expected remaining text for separator at position 4 to start with '/'. Actual: ''",
      );
    });

    it('Wrong separator', () => {
      TestUtils.assertLeftMessage(
        parser1('25|12'),
        "Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'",
      );
      TestUtils.assertLeftMessage(
        parser2('25|12'),
        "Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'",
      );
    });

    it('Same placeholder receives different values', () => {
      TestUtils.assertLeftMessage(
        parser1('25/12/2025 13'),
        "#MM is present more than once in template and receives differing values '12' and '13'",
      );
      TestUtils.assertLeftMessage(
        parser2('25|12'),
        "Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'",
      );
    });

    it('Text too long', () => {
      TestUtils.assertLeftMessage(
        parser1('25/12/2025 12is XMas'),
        "Expected text not consumed by template to be empty. Actual: 'is XMas'",
      );
      TestUtils.assertLeftMessage(
        parser2('25|12'),
        "Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'",
      );
    });

    it('Matching text', () => {
      TestUtils.assertRight(parser1('05/12/2025 12'), {
        dd: 5,
        MM: 12,
        yyyy: 2025,
      });
      TestUtils.assertRight(parser2('05/12/2025 12'), {
        dd: 5,
        MM: 12,
        yyyy: 2025,
      });
    });
  });
});
