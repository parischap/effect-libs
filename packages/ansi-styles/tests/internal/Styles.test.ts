import { pipe } from 'effect';

import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASStyles from '@parischap/ansi-styles/ASStyles';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASStyles', () => {
  const blackRed: ASStyles.Type = [ASStyle.black, ASStyle.red];
  const greenBlue: ASStyles.Type = [ASStyle.green, ASStyle.blue];

  it('toString', () => {
    TestUtils.strictEqual(ASStyles.toString(blackRed), 'Black/Red');
  });

  it('append', () => {
    const combined = pipe(blackRed, ASStyles.append(greenBlue));
    TestUtils.strictEqual(combined.length, 4);
    TestUtils.strictEqual(ASStyles.toString(combined), 'Black/Red/Green/Blue');
  });
});
