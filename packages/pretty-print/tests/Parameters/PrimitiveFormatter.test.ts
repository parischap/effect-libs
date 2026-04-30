import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import type { MTypes } from '@parischap/effect-lib';
import * as MString from '@parischap/effect-lib/MString';
import * as PPPrimitiveFormatter from '@parischap/pretty-print/PPPrimitiveFormatter';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPPrimitiveFormatter', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPPrimitiveFormatter.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPPrimitiveFormatter.utilInspectLike,
        PPPrimitiveFormatter.utilInspectLikeMaker({
          id: 'UtilInspectLike',
          maxStringLength: 10_000,
          quoteChar: "'",
          numberFormatter: MString.fromNumber(10),
          bigintFormatter: MString.fromNumber(10),
        }),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPPrimitiveFormatter.utilInspectLike,
        PPPrimitiveFormatter.utilInspectLikeMaker({
          id: 'Other',
          maxStringLength: 3,
          quoteChar: '"',
          numberFormatter: MString.fromNumber(10),
          bigintFormatter: MString.fromNumber(10),
        }),
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(PPPrimitiveFormatter.utilInspectLike.toString(), 'UtilInspectLike');
  });

  describe('utilInspectLike', () => {
    const format = (value: MTypes.Primitive): string =>
      PPPrimitiveFormatter.action(PPPrimitiveFormatter.utilInspectLike)(
        PPValue.fromTopValue(value),
      );

    it('string under maxStringLength', () => {
      TestUtils.strictEqual(format('foo'), "'foo'");
    });

    it('string truncated at maxStringLength', () => {
      const longString = 'a'.repeat(10_001);
      const result = format(longString);
      TestUtils.assertTrue(result.endsWith("...'"));
      TestUtils.assertTrue(result.startsWith("'"));
    });

    it('number', () => {
      TestUtils.strictEqual(format(42), '42');
    });

    it('bigint', () => {
      TestUtils.strictEqual(format(5n), '5n');
    });

    it('boolean true', () => {
      TestUtils.strictEqual(format(true), 'true');
    });

    it('boolean false', () => {
      TestUtils.strictEqual(format(false), 'false');
    });

    it('symbol', () => {
      TestUtils.strictEqual(format(Symbol.for('foo')), 'Symbol(foo)');
    });

    it('undefined', () => {
      TestUtils.strictEqual(format(undefined), 'undefined');
    });

    it('null', () => {
      TestUtils.strictEqual(format(null), 'null');
    });
  });

  describe('utilInspectLikeMaker with custom maxStringLength', () => {
    const shortFormatter = PPPrimitiveFormatter.utilInspectLikeMaker({
      id: 'Short',
      maxStringLength: 6,
      quoteChar: "'",
      numberFormatter: MString.fromNumber(10),
      bigintFormatter: MString.fromNumber(10),
    });
    const format = (value: MTypes.Primitive): string =>
      PPPrimitiveFormatter.action(shortFormatter)(PPValue.fromTopValue(value));

    it('string under maxStringLength', () => {
      TestUtils.strictEqual(format('foo'), "'foo'");
    });

    it('string over maxStringLength', () => {
      TestUtils.strictEqual(format('foobar1'), "'foo...'");
    });
  });
});
