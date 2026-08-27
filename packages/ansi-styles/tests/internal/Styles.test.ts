import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import { pipe } from 'effect';

import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASStyles from '@parischap/ansi-styles/ASStyles';

describe('ASStyles', () => {
  const blackRed: ASStyles.Type = [ASStyle.black, ASStyle.red];
  const greenBlue: ASStyles.Type = [ASStyle.green, ASStyle.blue];

  it('toString', () => {
    assert.strictEqual(ASStyles.toString(blackRed), 'Black/Red');
  });

  it('append', () => {
    const combined = pipe(blackRed, ASStyles.append(greenBlue));
    assert.strictEqual(combined.length, 4);
    assert.strictEqual(ASStyles.toString(combined), 'Black/Red/Green/Blue');
  });
});
