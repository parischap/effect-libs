import * as TestUtils from '@parischap/configs/TestUtils';
import { CVTemplatePartSeparator } from '@parischap/conversions';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplatePartSeparator', () => {
  const separator = CVTemplatePartSeparator.make('foo');

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplatePartSeparator.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(separator.toString(), 'foo');
    });
  });

  describe('Parsing', () => {
    const parser = CVTemplatePartSeparator.toParser(separator);
    it('Not starting by value', () => {
      TestUtils.assertLeftMessage(
        parser(1, ''),
        "Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''",
      );
      TestUtils.assertLeft(parser(1, 'fo1 and bar'));
    });

    it('Passing', () => {
      TestUtils.assertRight(parser(1, 'foo and bar'), ' and bar');
    });
  });
});
