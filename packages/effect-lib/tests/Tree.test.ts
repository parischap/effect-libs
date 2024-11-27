/* eslint-disable functional/no-expression-statements */
import { MTree } from '@parischap/effect-lib';
import { Array, pipe, Tuple } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MTree', () => {
	interface TestInput {
		readonly value: number;
		/* eslint-disable-next-line functional/prefer-readonly-type */
		children: Array<TestInput>;
	}
	const testInput: TestInput = {
		value: 5,
		children: [
			{
				value: 6,
				children: [
					{
						value: 8,
						children: []
					},
					{
						value: 9,
						children: []
					}
				]
			},
			{
				value: 7,
				children: []
			},
			{
				value: 8,
				children: []
			}
		]
	};
	describe('Recursive functions', () => {
		it('unfoldTree', () => {
			const testTree = pipe(
				testInput,
				MTree.unfoldTree((seed) => Tuple.make(seed.value, seed.children))
			);
			expect(testTree.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": 5,
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 6,
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 8,
          "forest": []
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 7,
      "forest": []
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 8,
      "forest": []
    }
  ]
}`);
		});
	});

	describe('Non-recursive functions', () => {
		it('nonRecursiveUnfoldAndMap without cycles', () => {
			const testTree = pipe(
				testInput,
				MTree.nonRecursiveUnfoldAndMap((seed) => Tuple.make(seed.value, seed.children))
			);
			expect(testTree.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": 5,
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 6,
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 8,
          "forest": []
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 7,
      "forest": []
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 8,
      "forest": []
    }
  ]
}`);
		});

		const cyclicalTestInput: TestInput = {
			value: 5,
			children: [
				{
					value: 6,
					children: [
						{
							value: 8,
							children: []
						},
						{
							value: 9,
							children: []
						}
					]
				},
				{
					value: 7,
					children: []
				},
				{
					value: 8,
					children: []
				}
			]
		};

		/* eslint-disable functional/immutable-data */
		/* @ts-expect-error object is not undefined */
		cyclicalTestInput.children[0].children[0].children.push(cyclicalTestInput);
		/* eslint-enable functional/immutable-data */
		it('nonRecursiveUnfoldAndMap with cycles', () => {
			const testTree = pipe(
				cyclicalTestInput,
				MTree.nonRecursiveUnfoldAndMap((seed, isCyclical) =>
					isCyclical ? Tuple.make(0, Array.empty()) : Tuple.make(seed.value, seed.children)
				)
			);
			expect(testTree.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": 5,
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 6,
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 8,
          "forest": [
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": 0,
              "forest": []
            }
          ]
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 7,
      "forest": []
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": 8,
      "forest": []
    }
  ]
}`);
		});
	});
});
