import * as Array from 'effect/Array';

import * as ASCode from '@parischap/ansi-styles/ASCode';

import { assert, describe, it } from '@effect/vitest';

describe('ASCode', () => {
  describe('fromNonEmptySequence', () => {
    it('Single element', () => {
      assert.strictEqual(ASCode.fromNonEmptySequence([1]), '\x1B[1m');
    });

    it('Multiple elements separated by semicolons', () => {
      assert.strictEqual(ASCode.fromNonEmptySequence([1, 31]), '\x1B[1;31m');
    });

    it('Three elements', () => {
      assert.strictEqual(ASCode.fromNonEmptySequence([38, 5, 2]), '\x1B[38;5;2m');
    });
  });

  describe('fromSequence', () => {
    it('From empty sequence', () => {
      assert.strictEqual(ASCode.fromSequence(Array.empty()), '');
    });

    it('From non-empty sequence', () => {
      assert.strictEqual(ASCode.fromSequence(Array.make(0, 1)), '\x1B[0;1m');
    });
  });

  describe('Instances', () => {
    it('empty', () => {
      assert.strictEqual(ASCode.empty, '');
    });

    it('reset', () => {
      assert.strictEqual(ASCode.reset, '\x1B[0m');
    });

    it('bold', () => {
      assert.strictEqual(ASCode.bold, '\x1B[1m');
    });

    it('dim', () => {
      assert.strictEqual(ASCode.dim, '\x1B[2m');
    });

    it('italic', () => {
      assert.strictEqual(ASCode.italic, '\x1B[3m');
    });

    it('underlined', () => {
      assert.strictEqual(ASCode.underlined, '\x1B[4m');
    });

    it('blinking', () => {
      assert.strictEqual(ASCode.blinking, '\x1B[5m');
    });

    it('inversed', () => {
      assert.strictEqual(ASCode.inversed, '\x1B[7m');
    });

    it('hidden', () => {
      assert.strictEqual(ASCode.hidden, '\x1B[8m');
    });

    it('struckThrough', () => {
      assert.strictEqual(ASCode.struckThrough, '\x1B[9m');
    });

    it('overlined', () => {
      assert.strictEqual(ASCode.overlined, '\x1B[53m');
    });

    it('notBoldNotDim', () => {
      assert.strictEqual(ASCode.notBoldNotDim, '\x1B[22m');
    });

    it('notItalic', () => {
      assert.strictEqual(ASCode.notItalic, '\x1B[23m');
    });

    it('notUnderlined', () => {
      assert.strictEqual(ASCode.notUnderlined, '\x1B[24m');
    });

    it('notBlinking', () => {
      assert.strictEqual(ASCode.notBlinking, '\x1B[25m');
    });

    it('notInversed', () => {
      assert.strictEqual(ASCode.notInversed, '\x1B[27m');
    });

    it('notHidden', () => {
      assert.strictEqual(ASCode.notHidden, '\x1B[28m');
    });

    it('notStruckThrough', () => {
      assert.strictEqual(ASCode.notStruckThrough, '\x1B[29m');
    });

    it('notOverlined', () => {
      assert.strictEqual(ASCode.notOverlined, '\x1B[55m');
    });

    it('defaultForegroundColor', () => {
      assert.strictEqual(ASCode.defaultForegroundColor, '\x1B[39m');
    });

    it('defaultBackgroundColor', () => {
      assert.strictEqual(ASCode.defaultBackgroundColor, '\x1B[49m');
    });
  });
});
