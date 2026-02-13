import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVReal from '@parischap/conversions/CVReal';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import { MInputError, MTypes } from '@parischap/effect-lib';
import { Either, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplateParser', () => {
  const params = {
    fillChar: '0',
    numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay),
  };
  const placeholder = CVTemplatePlaceholder;
  const sep = CVTemplateSeparator;

  const templateParts = [
    placeholder.fixedLengthToReal({ ...params, name: 'dd', length: 2 }),
    sep.slash,
    placeholder.fixedLengthToReal({ ...params, name: 'MM', length: 2 }),
    sep.slash,
    placeholder.fixedLengthToReal({ ...params, name: 'yyyy', length: 4 }),
    sep.space,
    placeholder.real({ ...params, name: 'MM' }),
  ];

  const templateParser1 = CVTemplateParser.fromTemplate(CVTemplate.make(...templateParts));
  const templateParser2 = CVTemplateParser.fromTemplateParts(...templateParts);

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

#dd: 2-character string left-padded with '0' to unsigned integer.
#MM: 2-character string left-padded with '0' to unsigned integer.
#yyyy: 4-character string left-padded with '0' to unsigned integer.
#MM: unsigned integer`,
      );
    });
  });

  describe('toParser', () => {
    const parser = CVTemplate.toParser(template);

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof parser,
        MTypes.OneArgFunction<
          string,
          Either.Either<
            {
              readonly dd: CVReal.Type;
              readonly MM: CVReal.Type;
              readonly yyyy: CVReal.Type;
            },
            MInputError.Type
          >
        >
      >(),
    );

    it('Empty text', () => {
      TestUtils.assertLeftMessage(parser(''), 'Expected length of #dd to be: 2. Actual: 0');
    });

    it('Text too short', () => {
      TestUtils.assertLeftMessage(
        parser('25/12'),
        "Expected remaining text for separator at position 4 to start with '/'. Actual: ''",
      );
    });

    it('Wrong separator', () => {
      TestUtils.assertLeftMessage(
        parser('25|12'),
        "Expected remaining text for separator at position 2 to start with '/'. Actual: '|12'",
      );
    });

    it('Same placeholder receives different values', () => {
      TestUtils.assertLeftMessage(
        parser('25/12/2025 13'),
        "#MM is present more than once in template and receives differing values '12' and '13'",
      );
    });

    it('Text too long', () => {
      TestUtils.assertLeftMessage(
        parser('25/12/2025 12is XMas'),
        "Expected text not consumed by template to be empty. Actual: 'is XMas'",
      );
    });

    it('Matching text', () => {
      TestUtils.assertRight(parser('05/12/2025 12'), {
        dd: CVReal.unsafeFromNumber(5),
        MM: CVReal.unsafeFromNumber(12),
        yyyy: CVReal.unsafeFromNumber(2025),
      });
    });
  });

  describe('toFormatter', () => {
    const formatter = CVTemplate.toFormatter(template);

    TestUtils.assertTrueType(
      TestUtils.areEqualTypes<
        typeof formatter,
        MTypes.OneArgFunction<
          {
            readonly dd: CVReal.Type;
            readonly MM: CVReal.Type;
            readonly yyyy: CVReal.Type;
          },
          Either.Either<string, MInputError.Type>
        >
      >(),
    );

    it('With correct values', () => {
      TestUtils.assertRight(
        formatter({
          dd: CVReal.unsafeFromNumber(5),
          MM: CVReal.unsafeFromNumber(12),
          yyyy: CVReal.unsafeFromNumber(2025),
        }),
        '05/12/2025 12',
      );
    });

    it('With incorrect values', () => {
      TestUtils.assertLeftMessage(
        formatter({
          dd: CVReal.unsafeFromNumber(115),
          MM: CVReal.unsafeFromNumber(12),
          yyyy: CVReal.unsafeFromNumber(2025),
        }),
        'Expected length of #dd to be: 2. Actual: 3',
      );
    });
  });
});
