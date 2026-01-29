import { ASText } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { PPOption, PPValue, PPValues } from '@parischap/pretty-print';
import { Array, flow, HashMap, pipe } from 'effect';
import { inspect } from 'node:util';
import { describe, it } from 'vitest';

describe('Values', () => {
  it('fromProperties', () => {
    const topValueProto = {
      toString(): string {
        return 'MyName';
      },
    };

    const topValue = Object.assign(Object.create(topValueProto), {
      a: [1, 3],
      b: true,
    }) as unknown;

    TestUtils.strictEqual(
      pipe(
        PPValue.fromTopValue(topValue) as PPValue.NonPrimitive,
        PPValues.fromProperties(1),
        Array.map((p) => p.toString()),
        Array.join('\n'),
      ),
      `{
  "_id": "@parischap/pretty-print/Value/",
  "content": [
    1,
    3
  ],
  "contentType": 8,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a"
  ],
  "oneLineStringKey": "a",
  "hasSymbolicKey": false,
  "isEnumerable": true
}
{
  "_id": "@parischap/pretty-print/Value/",
  "content": true,
  "contentType": 3,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "b"
  ],
  "oneLineStringKey": "b",
  "hasSymbolicKey": false,
  "isEnumerable": true
}
{
  "_id": "@parischap/pretty-print/Value/",
  "contentType": 9,
  "depth": 1,
  "protoDepth": 1,
  "stringKey": [
    "toString"
  ],
  "oneLineStringKey": "toString",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`,
    );
  });

  it('fromValueIterable', () => {
    TestUtils.strictEqual(
      pipe(
        PPValue.fromTopValue([1, 'a']) as PPValue.NonPrimitive,
        PPValues.fromValueIterable,
        Array.map((p) => p.toString()),
        Array.join('\n'),
      ),
      `{
  "_id": "@parischap/pretty-print/Value/",
  "content": 1,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "0"
  ],
  "oneLineStringKey": "0",
  "hasSymbolicKey": false,
  "isEnumerable": true
}
{
  "_id": "@parischap/pretty-print/Value/",
  "content": "a",
  "contentType": 0,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "1"
  ],
  "oneLineStringKey": "1",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`,
    );
  });

  it('fromKeyValueIterable', () => {
    const stringifier: PPOption.Stringifier.Type = flow(inspect, ASText.fromString, Array.of);
    TestUtils.strictEqual(
      pipe(
        PPValue.fromTopValue(HashMap.make(['a', 1], ['b', 2])) as PPValue.NonPrimitive,
        PPValues.fromKeyValueIterable(stringifier),
        Array.map((p) => p.toString()),
        Array.join('\n'),
      ),
      `{
  "_id": "@parischap/pretty-print/Value/",
  "content": 1,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a"
  ],
  "oneLineStringKey": "a",
  "hasSymbolicKey": false,
  "isEnumerable": true
}
{
  "_id": "@parischap/pretty-print/Value/",
  "content": 2,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "b"
  ],
  "oneLineStringKey": "b",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`,
    );
  });
});
