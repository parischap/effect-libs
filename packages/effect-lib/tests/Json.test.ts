import * as TestUtils from '@parischap/configs/TestUtils';
import * as MJson from '@parischap/effect-lib/MJson';

import * as Effect from 'effect/Effect';
import { describe, it } from 'vitest';

describe('MJson', () => {
  describe('stringify', () => {
    it('Valid value', () => {
      TestUtils.strictEqual(Effect.runSync(MJson.stringify({ a: 1, b: true })), '{"a":1,"b":true}');
    });

    it('Circular reference throws', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;
      TestUtils.throws(() => Effect.runSync(MJson.stringify(circular)));
    });
  });

  describe('parse', () => {
    it('Valid JSON string', () => {
      TestUtils.deepStrictEqual(Effect.runSync(MJson.parse('{"a":1,"b":true}')), { a: 1, b: true });
    });

    it('Invalid JSON string', () => {
      TestUtils.throws(() => Effect.runSync(MJson.parse('not valid json')));
    });
  });
});
