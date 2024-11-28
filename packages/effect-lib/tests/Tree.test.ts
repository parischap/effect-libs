/* eslint-disable functional/no-expression-statements */
import { MTree, MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe, Struct, Tuple } from 'effect';
import { describe, expect, it } from 'vitest';

interface TestInput {
	readonly value: number;
	/* eslint-disable-next-line functional/prefer-readonly-type */
	children: Array<TestInput>;
}

describe('MTree', () => {
	describe('Tag, prototype and guards', () => {
		const testTree = MTree.make({ value: 5, forest: Array.empty() });

		it('moduleTag', () => {
			expect(MTree.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(
						testTree,
						MTree.make({
							value: 5,
							forest: Array.of(MTree.make({ value: 4, forest: Array.empty() }))
						})
					)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(testTree, MTree.make({ value: 4, forest: Array.empty() }))).toBe(false);
			});
		});

		it('.pipe()', () => {
			expect(testTree.pipe(Struct.get('value'))).toBe(5);
		});

		it('has', () => {
			expect(MTree.has(testTree)).toBe(true);
			expect(MTree.has(new Date())).toBe(false);
		});
	});

	describe('Non-cyclical test input', () => {
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

		it('nonRecursiveUnfoldAndMap and .toString()', () => {
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
	});

	describe('Cyclical test input', () => {
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

		/* eslint-disable functional/immutable-data */
		/* @ts-expect-error object is not undefined */
		testInput.children[0].children[0].children.push(testInput);
		/* eslint-enable functional/immutable-data */
		it('nonRecursiveUnfoldAndMap and .toString()', () => {
			const testTree = pipe(
				testInput,
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
