import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVSignValue from '@parischap/conversions/CVSignValue';

import { describe, it } from 'vitest';

describe('CVSignValue', () => {
  describe('fromSignString', () => {
    it('Minus sign', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString('-'), -1);
    });

    it('Plus sign', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString('+'), 1);
    });

    it('Empty string', () => {
      TestUtils.assertEquals(CVSignValue.fromSignString(''), 1);
    });
  });
});
