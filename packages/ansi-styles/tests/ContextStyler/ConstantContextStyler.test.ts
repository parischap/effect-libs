import { ASConstantContextStyler, ASContextStyler } from '@parischap/ansi-styles';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASConstantContextStyler', () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const { red }: { readonly red: ASContextStyler.Type<Value> } = ASConstantContextStyler;

  const value1: Value = {
    pos1: 2,
    otherStuff: 'dummy',
  };

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASConstantContextStyler.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.strictEqual(red.toString(), 'RedStyler');
  });

  it('toStyle', () => {
    TestUtils.assertEquals(ASContextStyler.toStyle(red)(value1).style, ASStyleCharacteristics.red);
  });
});
