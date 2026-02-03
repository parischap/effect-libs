import { ASContextStylerBase, ASContextStylerConstant } from '@parischap/ansi-styles';
import { ASStyleCharacteristics } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASContextStylerConstant', () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const { red }: { readonly red: ASContextStylerBase.Type<Value> } = ASContextStylerConstant;

  const value1: Value = {
    pos1: 2,
    otherStuff: 'dummy',
  };

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStylerConstant.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.strictEqual(red.toString(), 'RedStyler');
  });

  it('toStyle', () => {
    TestUtils.assertEquals(
      ASContextStylerBase.toStyle(red)(value1).style,
      ASStyleCharacteristics.red,
    );
  });
});
