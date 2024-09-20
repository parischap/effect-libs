/* eslint-disable functional/no-expression-statements */
import { MTree } from '@parischap/effect-lib';
import { Array, Tuple } from 'effect';
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
			const testTree = MTree.unfoldTree(testInput, (seed) => Tuple.make(seed.value, seed.children));
			expect(testTree.toString()).toBe(`{
  "value": 5,
  "forest": [
    {
      "value": 6,
      "forest": [
        {
          "value": 8,
          "forest": []
        },
        {
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "value": 7,
      "forest": []
    },
    {
      "value": 8,
      "forest": []
    }
  ]
}`);
		});
	});

	describe('Non-recursive functions', () => {
		it('nonRecursiveUnfoldAndMap without cycles', () => {
			const testTree = MTree.nonRecursiveUnfoldAndMap(testInput, (seed) =>
				Tuple.make(seed.value, seed.children)
			);
			expect(testTree.toString()).toBe(`{
  "value": 5,
  "forest": [
    {
      "value": 6,
      "forest": [
        {
          "value": 8,
          "forest": []
        },
        {
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "value": 7,
      "forest": []
    },
    {
      "value": 8,
      "forest": []
    }
  ]
}`);
		});

		const cyclicTestInput: TestInput = {
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
		cyclicTestInput.children[0].children[0].children.push(cyclicTestInput);
		/* eslint-enable functional/immutable-data */
		it('nonRecursiveUnfoldAndMap with cycles', () => {
			const testTree = MTree.nonRecursiveUnfoldAndMap(cyclicTestInput, (seed, isCyclic) =>
				isCyclic ? Tuple.make(0, Array.empty()) : Tuple.make(seed.value, seed.children)
			);
			expect(testTree.toString()).toBe(`{
  "value": 5,
  "forest": [
    {
      "value": 6,
      "forest": [
        {
          "value": 8,
          "forest": [
            {
              "value": 0,
              "forest": []
            }
          ]
        },
        {
          "value": 9,
          "forest": []
        }
      ]
    },
    {
      "value": 7,
      "forest": []
    },
    {
      "value": 8,
      "forest": []
    }
  ]
}`);
		});
	});
});
