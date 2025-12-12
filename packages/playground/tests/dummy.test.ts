/* eslint-disable functional/no-expression-statements */
import * as TestUtils from '@parischap/configs/TestUtils';
import { describe, it } from 'vitest';

describe('dummy', () => {
  it('dummy', () => {
    TestUtils.deepStrictEqual(1, 1);
  });
});
