import { ASCode } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Array } from 'effect';
import { describe, it } from 'vitest';

describe('ASCode', () => {
  describe('fromSequence', () => {
    it('From empty sequence', () => {
      TestUtils.strictEqual(ASCode.fromSequence(Array.empty()), '');
    });

    it('From non-empty sequence', () => {
      TestUtils.strictEqual(ASCode.fromSequence(Array.make(0, 1)), '\x1B[0;1m');
    });
  });
});
