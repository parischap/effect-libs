import * as TestUtils from '@parischap/configs/TestUtils';
import { MStringSearchResult } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MString.SearchResult', () => {
  const testSearchResult = MStringSearchResult.make({
    startIndex: 3,
    endIndex: 6,
    match: 'foo',
  });

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MStringSearchResult.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('byLongestFirst', () => {
    TestUtils.strictEqual(
      MStringSearchResult.byLongestFirst(
        testSearchResult,
        MStringSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
      ),
      -1,
    );
    TestUtils.strictEqual(
      MStringSearchResult.byLongestFirst(
        testSearchResult,
        MStringSearchResult.make({ startIndex: 3, endIndex: 7, match: 'foo1' }),
      ),
      1,
    );
  });
});
