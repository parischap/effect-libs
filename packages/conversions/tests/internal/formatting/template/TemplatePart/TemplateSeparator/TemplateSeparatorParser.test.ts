import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as CVTemplateSeparatorParser from '@parischap/conversions/CVTemplateSeparatorParser';

describe('CVTemplateSeparatorParser', () => {
  const separator = CVTemplateSeparator.make('foo');

  const parser = CVTemplateSeparatorParser.fromSeparator(separator);
  it('Not starting by value', () => {
    TestUtils.assertFailureMessage(
      parser(1, ''),
      "Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''",
    );
    TestUtils.assertFailure(parser(1, 'fo1 and bar'));
  });

  it('Passing', () => {
    TestUtils.assertSuccess(parser(1, 'foo and bar'), ' and bar');
  });
});
