import * as ASSequence from '@parischap/ansi-styles/ASSequence';

import { assert, describe, it } from '@effect/vitest';

describe('ASSequence', () => {
  it('empty', () => {
    assert.deepStrictEqual(ASSequence.empty, []);
  });

  describe('On sequences', () => {
    it('reset', () => {
      assert.deepStrictEqual(ASSequence.reset, [0]);
    });

    it('bold', () => {
      assert.deepStrictEqual(ASSequence.bold, [1]);
    });

    it('dim', () => {
      assert.deepStrictEqual(ASSequence.dim, [2]);
    });

    it('italic', () => {
      assert.deepStrictEqual(ASSequence.italic, [3]);
    });

    it('underlined', () => {
      assert.deepStrictEqual(ASSequence.underlined, [4]);
    });

    it('blinking', () => {
      assert.deepStrictEqual(ASSequence.blinking, [5]);
    });

    it('inversed', () => {
      assert.deepStrictEqual(ASSequence.inversed, [7]);
    });

    it('hidden', () => {
      assert.deepStrictEqual(ASSequence.hidden, [8]);
    });

    it('struckThrough', () => {
      assert.deepStrictEqual(ASSequence.struckThrough, [9]);
    });

    it('overlined', () => {
      assert.deepStrictEqual(ASSequence.overlined, [53]);
    });
  });

  describe('Off sequences', () => {
    it('notBoldNotDim', () => {
      assert.deepStrictEqual(ASSequence.notBoldNotDim, [22]);
    });

    it('notItalic', () => {
      assert.deepStrictEqual(ASSequence.notItalic, [23]);
    });

    it('notUnderlined', () => {
      assert.deepStrictEqual(ASSequence.notUnderlined, [24]);
    });

    it('notBlinking', () => {
      assert.deepStrictEqual(ASSequence.notBlinking, [25]);
    });

    it('notInversed', () => {
      assert.deepStrictEqual(ASSequence.notInversed, [27]);
    });

    it('notHidden', () => {
      assert.deepStrictEqual(ASSequence.notHidden, [28]);
    });

    it('notStruckThrough', () => {
      assert.deepStrictEqual(ASSequence.notStruckThrough, [29]);
    });

    it('notOverlined', () => {
      assert.deepStrictEqual(ASSequence.notOverlined, [55]);
    });
  });

  describe('Color sequences', () => {
    it('defaultForegroundColor', () => {
      assert.deepStrictEqual(ASSequence.defaultForegroundColor, [39]);
    });

    it('defaultBackgroundColor', () => {
      assert.deepStrictEqual(ASSequence.defaultBackgroundColor, [49]);
    });
  });
});
