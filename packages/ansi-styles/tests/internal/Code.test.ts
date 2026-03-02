import * as ASCode from '@parischap/ansi-styles/ASCode';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Array from 'effect/Array'
import { describe, it } from 'vitest';

describe('ASCode', () => {
  describe('fromNonEmptySequence', () => {
    it('Single element', () => {
      TestUtils.strictEqual(ASCode.fromNonEmptySequence([1]), '\x1B[1m');
    });

    it('Multiple elements separated by semicolons', () => {
      TestUtils.strictEqual(ASCode.fromNonEmptySequence([1, 31]), '\x1B[1;31m');
    });

    it('Three elements', () => {
      TestUtils.strictEqual(ASCode.fromNonEmptySequence([38, 5, 2]), '\x1B[38;5;2m');
    });
  });

  describe('fromSequence', () => {
    it('From empty sequence', () => {
      TestUtils.strictEqual(ASCode.fromSequence(Array.empty()), '');
    });

    it('From non-empty sequence', () => {
      TestUtils.strictEqual(ASCode.fromSequence(Array.make(0, 1)), '\x1B[0;1m');
    });
  });

  describe('Instances', () => {
    it('empty', () => {
      TestUtils.strictEqual(ASCode.empty, '');
    });

    it('reset', () => {
      TestUtils.strictEqual(ASCode.reset, '\x1B[0m');
    });

    it('bold', () => {
      TestUtils.strictEqual(ASCode.bold, '\x1B[1m');
    });

    it('dim', () => {
      TestUtils.strictEqual(ASCode.dim, '\x1B[2m');
    });

    it('italic', () => {
      TestUtils.strictEqual(ASCode.italic, '\x1B[3m');
    });

    it('underlined', () => {
      TestUtils.strictEqual(ASCode.underlined, '\x1B[4m');
    });
  });
});
