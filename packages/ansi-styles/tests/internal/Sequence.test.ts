import * as ASSequence from '@parischap/ansi-styles/ASSequence';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASSequence', () => {
  it('empty', () => {
    TestUtils.deepStrictEqual(ASSequence.empty, []);
  });

  describe('On sequences', () => {
    it('reset', () => {
      TestUtils.deepStrictEqual(ASSequence.reset, [0]);
    });

    it('bold', () => {
      TestUtils.deepStrictEqual(ASSequence.bold, [1]);
    });

    it('dim', () => {
      TestUtils.deepStrictEqual(ASSequence.dim, [2]);
    });

    it('italic', () => {
      TestUtils.deepStrictEqual(ASSequence.italic, [3]);
    });

    it('underlined', () => {
      TestUtils.deepStrictEqual(ASSequence.underlined, [4]);
    });

    it('blinking', () => {
      TestUtils.deepStrictEqual(ASSequence.blinking, [5]);
    });

    it('inversed', () => {
      TestUtils.deepStrictEqual(ASSequence.inversed, [7]);
    });

    it('hidden', () => {
      TestUtils.deepStrictEqual(ASSequence.hidden, [8]);
    });

    it('struckThrough', () => {
      TestUtils.deepStrictEqual(ASSequence.struckThrough, [9]);
    });

    it('overlined', () => {
      TestUtils.deepStrictEqual(ASSequence.overlined, [53]);
    });
  });

  describe('Off sequences', () => {
    it('notBoldNotDim', () => {
      TestUtils.deepStrictEqual(ASSequence.notBoldNotDim, [22]);
    });

    it('notItalic', () => {
      TestUtils.deepStrictEqual(ASSequence.notItalic, [23]);
    });

    it('notUnderlined', () => {
      TestUtils.deepStrictEqual(ASSequence.notUnderlined, [24]);
    });

    it('notBlinking', () => {
      TestUtils.deepStrictEqual(ASSequence.notBlinking, [25]);
    });

    it('notInversed', () => {
      TestUtils.deepStrictEqual(ASSequence.notInversed, [27]);
    });

    it('notHidden', () => {
      TestUtils.deepStrictEqual(ASSequence.notHidden, [28]);
    });

    it('notStruckThrough', () => {
      TestUtils.deepStrictEqual(ASSequence.notStruckThrough, [29]);
    });

    it('notOverlined', () => {
      TestUtils.deepStrictEqual(ASSequence.notOverlined, [55]);
    });
  });

  describe('Color sequences', () => {
    it('defaultForegroundColor', () => {
      TestUtils.deepStrictEqual(ASSequence.defaultForegroundColor, [39]);
    });

    it('defaultBackgroundColor', () => {
      TestUtils.deepStrictEqual(ASSequence.defaultBackgroundColor, [49]);
    });
  });
});
