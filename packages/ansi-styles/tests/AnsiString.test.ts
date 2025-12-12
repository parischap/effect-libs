import { ASAnsiString } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Array } from 'effect';
import { describe, it } from 'vitest';

describe('AnsiString', () => {
  describe('fromSequence', () => {
    it('From empty sequence', () => {
      TestUtils.strictEqual(ASAnsiString.fromSequence(Array.empty()), '');
    });

    it('From non-empty sequence', () => {
      TestUtils.strictEqual(ASAnsiString.fromSequence(Array.make(0, 1)), '\x1b[0;1m');
    });
  });
});
