import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplatePartSeparator from '@parischap/conversions/CVTemplatePartSeparator';
import * as CVTemplatePartSeparatorParser from '@parischap/conversions/CVTemplatePartSeparatorParser';
import { describe, it } from 'vitest';

describe('CVTemplatePartSeparatorParser', () => {
  const separator = CVTemplatePartSeparator.make('foo');

  const parser = CVTemplatePartSeparatorParser.fromSeparator(separator);
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
