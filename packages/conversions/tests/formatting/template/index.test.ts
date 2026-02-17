import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import {pipe} from 'effect'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('CVTemplate', () => {
  const params = {
    fillChar: '0',
    numberBase10Format: pipe(CVNumberBase10Format.integer, CVNumberBase10Format.withoutSignDisplay),
  };
  const placeholder = CVTemplatePlaceholder;
  const sep = CVTemplateSeparator;

  const template = CVTemplate.make(
    placeholder.fixedLengthToReal({ ...params, name: 'dd', length: 2 }),
    sep.slash,
    placeholder.fixedLengthToReal({ ...params, name: 'MM', length: 2 }),
    sep.slash,
    placeholder.fixedLengthToReal({ ...params, name: 'yyyy', length: 4 }),
    sep.space,
    placeholder.real({ ...params, name: 'MM' }),
  );

  TestUtils.assertTrueType(
    TestUtils.areEqualTypes<
      typeof template,
      CVTemplate.Type<{ readonly MM: Type; readonly dd: Type; readonly yyyy: Type }>
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

#dd: 2-character string left-padded with '0' to unsigned integer.
#MM: 2-character string left-padded with '0' to unsigned integer.
#yyyy: 4-character string left-padded with '0' to unsigned integer.
#MM: unsigned integer`,
      );
    });
  });
});
