import { describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';
import * as MTemplateSeparatorParser from '@parischap/effect-lib/MTemplateSeparatorParser';

describe('MTemplateSeparatorParser', () => {
  const separator = MTemplateSeparator.make('foo');

  const parser = MTemplateSeparatorParser.fromSeparator(separator);
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
