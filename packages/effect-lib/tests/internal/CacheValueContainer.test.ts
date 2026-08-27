import { pipe } from 'effect';
import * as Equal from 'effect/Equal';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MCacheValueContainer from '@parischap/effect-lib/MCacheValueContainer';

import { assert, describe, it } from '@effect/vitest';

describe('MCacheValueContainer', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MCacheValueContainer.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });

  describe('make', () => {
    const container = MCacheValueContainer.make({ value: 42, storeDate: 1000 });

    it('value', () => {
      assert.strictEqual(container.value, 42);
    });

    it('storeDate', () => {
      assert.strictEqual(container.storeDate, 1000);
    });
  });

  describe('Equality', () => {
    it('Two containers with same fields are equal', () => {
      const container1 = MCacheValueContainer.make({ value: 'hello', storeDate: 500 });
      const container2 = MCacheValueContainer.make({ value: 'hello', storeDate: 500 });
      assert.isTrue(Equal.equals(container1, container2));
    });

    it('Two containers with different values are not equal', () => {
      const container1 = MCacheValueContainer.make({ value: 'hello', storeDate: 500 });
      const container2 = MCacheValueContainer.make({ value: 'world', storeDate: 500 });
      assert.isFalse(Equal.equals(container1, container2));
    });

    it('Two containers with different storeDates are not equal', () => {
      const container1 = MCacheValueContainer.make({ value: 'hello', storeDate: 500 });
      const container2 = MCacheValueContainer.make({ value: 'hello', storeDate: 600 });
      assert.isFalse(Equal.equals(container1, container2));
    });
  });

  describe('Inspectable', () => {
    it('toString', () => {
      const container = MCacheValueContainer.make({ value: 'test', storeDate: 0 });
      const str = pipe(container, (c) => c.toString());
      assert.isTrue(str.length > 0);
    });
  });
});
