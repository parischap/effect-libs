import * as Array from 'effect/Array';

import * as ASCode from '@parischap/ansi-styles/ASCode';
import * as TestUtils from '@parischap/configs/TestUtils';

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

    it('blinking', () => {
      TestUtils.strictEqual(ASCode.blinking, '\x1B[5m');
    });

    it('inversed', () => {
      TestUtils.strictEqual(ASCode.inversed, '\x1B[7m');
    });

    it('hidden', () => {
      TestUtils.strictEqual(ASCode.hidden, '\x1B[8m');
    });

    it('struckThrough', () => {
      TestUtils.strictEqual(ASCode.struckThrough, '\x1B[9m');
    });

    it('overlined', () => {
      TestUtils.strictEqual(ASCode.overlined, '\x1B[53m');
    });

    it('notBoldNotDim', () => {
      TestUtils.strictEqual(ASCode.notBoldNotDim, '\x1B[22m');
    });

    it('notItalic', () => {
      TestUtils.strictEqual(ASCode.notItalic, '\x1B[23m');
    });

    it('notUnderlined', () => {
      TestUtils.strictEqual(ASCode.notUnderlined, '\x1B[24m');
    });

    it('notBlinking', () => {
      TestUtils.strictEqual(ASCode.notBlinking, '\x1B[25m');
    });

    it('notInversed', () => {
      TestUtils.strictEqual(ASCode.notInversed, '\x1B[27m');
    });

    it('notHidden', () => {
      TestUtils.strictEqual(ASCode.notHidden, '\x1B[28m');
    });

    it('notStruckThrough', () => {
      TestUtils.strictEqual(ASCode.notStruckThrough, '\x1B[29m');
    });

    it('notOverlined', () => {
      TestUtils.strictEqual(ASCode.notOverlined, '\x1B[55m');
    });

    it('defaultForegroundColor', () => {
      TestUtils.strictEqual(ASCode.defaultForegroundColor, '\x1B[39m');
    });

    it('defaultBackgroundColor', () => {
      TestUtils.strictEqual(ASCode.defaultBackgroundColor, '\x1B[49m');
    });
  });
});
