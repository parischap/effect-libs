import { ASAnsiCode } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Array } from 'effect';
import { describe, it } from 'vitest';

describe('ASAnsiCode', () => {
  describe('fromSequence', () => {
    it('From empty sequence', () => {
      TestUtils.strictEqual(ASAnsiCode.fromSequence(Array.empty()), '');
    });

    it('From non-empty sequence', () => {
      TestUtils.strictEqual(ASAnsiCode.fromSequence(Array.make(0, 1)), '\x1B[0;1m');
    });
  });
});
