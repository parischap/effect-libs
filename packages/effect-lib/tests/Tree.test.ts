/* eslint-disable functional/no-expression-statements */
import { MTree, MTuple, MUtils } from '@parischap/effect-lib';
import { Array, Either, Equal, flow, Number, pipe, Struct } from 'effect';
import { describe, expect, it } from 'vitest';

interface TestInput {
	readonly value: '+' | '*' | number;
	readonly children: ReadonlyArray<TestInput>;
}

const unfold = (seed: TestInput, isCyclical: boolean) =>
	isCyclical ?
		Either.left(0)
	:	(pipe(
			seed,
			Either.liftPredicate(
				flow(Struct.get('children'), Array.isNonEmptyReadonlyArray),
				Struct.get('value')
			),
			Either.map(
				MTuple.makeBothBy({
					toFirst: Struct.get('value'),
					toSecond: Struct.get('children')
				})
			)
			/* eslint-disable-next-line functional/prefer-readonly-type*/
		) as Either.Either<['+' | '*', readonly TestInput[]], number>);

const fold = (value: '+' | '*', children: ReadonlyArray<number>) =>
	value === '+' ? Number.sumAll(children) : Number.multiplyAll(children);

const testInput1: TestInput = {
	value: '+',
	children: [
		{
			value: '*',
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
			value: '+',
			children: [
				{
					value: 1,
					children: []
				},
				{
					value: 2,
					children: []
				}
			]
		}
	]
};

const testTree1 = pipe(testInput1, MTree.unfold(unfold));
const testTree2 = pipe(testInput1, MTree.unfold(unfold));

const testInput3 = pipe(testInput1, JSON.stringify, JSON.parse) as TestInput;
/* @ts-expect-error it's a test */ /* eslint-disable-next-line functional/immutable-data*/
testInput3.children[1].children[0].value = 5;
const testTree3 = pipe(testInput3, MTree.unfold(unfold));

const testInput4 = pipe(testInput1, JSON.stringify, JSON.parse) as TestInput;
/* @ts-expect-error it's a test */ /* eslint-disable-next-line functional/immutable-data*/
testInput4.children[1].children[0] = testInput4;
const testTree4 = pipe(testInput4, MTree.unfold(unfold));

describe('MTree', () => {
	describe('Leaf', () => {
		describe('pipe and has', () => {
			it('Matching', () => {
				expect(MTree.Leaf.make(5).pipe(MTree.Leaf.has)).toBe(true);
			});
			it('Non matching', () => {
				expect(MTree.Leaf.has(new Date())).toBe(false);
			});
		});
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(MTree.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(testTree1, testTree2)).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(testTree1, testTree3)).toBe(false);
			});
		});

		describe('pipe and has', () => {
			it('Matching', () => {
				expect(MTree.make({ value: 5, forest: Array.empty() }).pipe(MTree.has)).toBe(true);
			});
			it('Non matching', () => {
				expect(MTree.has(new Date())).toBe(false);
			});
		});
	});

	describe('unfold and .toString()', () => {
		it('Non-cyclical test input', () => {
			expect(testTree1.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": "+",
  "_tag": "Tree",
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "*",
      "_tag": "Tree",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 8,
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 9,
          "_tag": "Leaf"
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "+",
      "_tag": "Tree",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 1,
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 2,
          "_tag": "Leaf"
        }
      ]
    }
  ]
}`);
		});

		it('Cyclical test input', () => {
			expect(testTree4.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": "+",
  "_tag": "Tree",
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "*",
      "_tag": "Tree",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 8,
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 9,
          "_tag": "Leaf"
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "+",
      "_tag": "Tree",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 0,
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": 2,
          "_tag": "Leaf"
        }
      ]
    }
  ]
}`);
		});
	});

	it('unfoldAndFold', () => {
		expect(pipe(testInput1, MTree.unfoldAndFold({ unfold, fold }))).toBe(75);
	});

	it('fold', () => {
		expect(pipe(testTree1, MTree.fold(fold))).toBe(75);
	});

	it('map', () => {
		expect(
			pipe(
				testTree1,
				MTree.map({ fNonLeaf: (value) => (value === '*' ? '+' : '*'), fLeaf: Number.increment }),
				MTree.fold(fold)
			)
		).toBe(114);
	});

	it('reduce', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduce({
					z: 3,
					fNonLeaf: (acc, value) => acc + (value === '*' ? 2 : 1),
					fLeaf: (acc, value) => acc + value
				})
			)
		).toBe(27);
	});

	it('reduceRight', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduceRight({
					z: 3,
					fNonLeaf: (acc, value) => acc + (value === '*' ? 2 : 1),
					fLeaf: (acc, value) => acc + value
				})
			)
		).toBe(27);
	});

	it('extendDown', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendDown({
					fNonLeaf: (node) => (node.value === '*' ? '+' : '*'),
					fLeaf: (node) => node.value + 1
				}),
				MTree.fold(fold)
			)
		).toBe(114);
	});

	it('extendUp', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendUp({
					fNonLeaf: (node) => (node.value === '*' ? '+' : '*'),
					fLeaf: (node) => node.value + 1
				}),
				MTree.fold(fold)
			)
		).toBe(114);
	});
});
