import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASPalette from '@parischap/ansi-styles/ASPalette';
import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStyle from '@parischap/pretty-print/PPStyle';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPStyle', () => {
  // A palette with 4 colours indexed 0-3
  const palette = ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.blue);

  // A value at depth 2 with a symbolic key
  const symbolicKey: unique symbol = Symbol.for('testKey');
  const context = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { [symbolicKey]: 3, b: 'foo' },
    key: symbolicKey,
    depth: 2,
    protoDepth: 0,
  });

  // A value at depth 1 with a string key
  const stringContext = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { a: 1 },
    key: 'a',
    depth: 1,
    protoDepth: 0,
  });

  describe('makeDepthIndexed', () => {
    it('Uses depth to index into the palette', () => {
      // depth=2 → index 2 → ASStyle.green
      TestUtils.assertEquals(
        ASContextStyler.style(PPStyle.makeDepthIndexed(palette))(context)('foo'),
        ASStyle.green('foo'),
      );
    });
  });

  describe('makeTypeIndexed', () => {
    it('Uses contentType to index into the palette', () => {
      // content is 3 (number), contentType=1 → index 1 → ASStyle.red
      TestUtils.assertEquals(
        ASContextStyler.style(PPStyle.makeTypeIndexed(palette))(context)('foo'),
        ASStyle.red('foo'),
      );
    });
  });

  describe('makeKeyTypeIndexed', () => {
    it('Symbolic key maps to index 1', () => {
      // hasSymbolicKey=true → +true=1 → index 1 → ASStyle.red
      TestUtils.assertEquals(
        ASContextStyler.style(PPStyle.makeKeyTypeIndexed(palette))(context)('foo'),
        ASStyle.red('foo'),
      );
    });

    it('String key maps to index 0', () => {
      // hasSymbolicKey=false → +false=0 → index 0 → ASStyle.black
      TestUtils.assertEquals(
        ASContextStyler.style(PPStyle.makeKeyTypeIndexed(palette))(stringContext)('foo'),
        ASStyle.black('foo'),
      );
    });
  });
});
