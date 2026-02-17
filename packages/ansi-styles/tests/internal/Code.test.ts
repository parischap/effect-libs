import * as ASCode from '@parischap/ansi-styles/ASCode';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Array from 'effect/Array'
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
