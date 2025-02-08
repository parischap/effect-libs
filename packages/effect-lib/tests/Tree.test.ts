/* eslint-disable functional/no-expression-statements */
import { MMatch, MString, MTree, MTuple, MTypes, MUtils } from '@parischap/effect-lib';
import { Array, Either, Equal, flow, Function, Option, pipe, Record } from 'effect';
import { describe, expect, it } from 'vitest';

const unfoldObject = (seed: MTypes.Unknown, cyclicalRef: Option.Option<'Array' | 'Record'>) =>
	pipe(
		cyclicalRef,
		Option.map(flow(MString.prepend('Cyclical '), Either.left)),
		Option.getOrElse(
			pipe(
				seed,
				MMatch.make,
				MMatch.when(MTypes.isPrimitive, flow(MString.fromPrimitive, Either.left)),
				MMatch.orElse(
					flow(
						MTuple.makeBothBy({
							toFirst: flow(
								MMatch.make,
								MMatch.when(MTypes.isArray, Function.constant('Array' as const)),
								MMatch.orElse(Function.constant('Record' as const))
							),
							toSecond: Record.values
						}),
						Either.right
					)
				),
				Function.constant
			)
		)
	);

const foldNonLeaf = (value: 'Array' | 'Record', children: ReadonlyArray<string>) => {
	const joined = Array.join(children, ', ');
	return value === 'Array' ? '[' + joined + ']' : '{ ' + joined + ' }';
};

const nonCyclicalObject1 = {
	a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
	b: [{ a: { a: ['s5'] }, b: 's6' }, 's7']
};

const nonCyclicalObject2 = {
	a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
	b: [{ a: { a: ['s5'] }, b: 's6' }, 's7']
};
/* eslint-disable-next-line functional/immutable-data */ /*  @ts-expect-error  this is a test*/
nonCyclicalObject2.b.push(nonCyclicalObject2.a[0]);

const cyclicalObject = {
	a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
	b: [{ a: { a: ['s5'] }, b: 's6' }, 's7']
};
/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */ /*  @ts-expect-error  this is a test*/
cyclicalObject.b[0].a.a.push(cyclicalObject.b);

const testTree1 = pipe(nonCyclicalObject1, MTree.unfold(unfoldObject));
const testTree2 = pipe(nonCyclicalObject1, MTree.unfold(unfoldObject));
const testTree3 = pipe(nonCyclicalObject2, MTree.unfold(unfoldObject));
const testTree4 = pipe(cyclicalObject, MTree.unfold(unfoldObject));

const foldedTestTree1 = '{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5] }, s6 }, s7] }';
const mappedTestTree1 = '[{ [[s1@, s2@], s3@], { s4@ } }, { [[{ s5@ }], s6@], s7@ }]';

describe('MTree', () => {
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

		it('pipe', () => {
			expect(testTree1.pipe(MTypes.isNonPrimitive)).toBe(true);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(testTree1.pipe(MTree.has)).toBe(true);
			});
			it('Non matching', () => {
				expect(MTree.has(new Date())).toBe(false);
			});
		});
	});

	it('unfold and .toString()', () => {
		expect(testTree1.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": "Record",
  "_tag": "NonLeaf",
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "Array",
      "_tag": "NonLeaf",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Record",
          "_tag": "NonLeaf",
          "forest": [
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "Record",
              "_tag": "NonLeaf",
              "forest": [
                {
                  "_id": "@parischap/effect-lib/Tree/",
                  "value": "s1",
                  "_tag": "Leaf"
                },
                {
                  "_id": "@parischap/effect-lib/Tree/",
                  "value": "s2",
                  "_tag": "Leaf"
                }
              ]
            },
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "s3",
              "_tag": "Leaf"
            }
          ]
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Array",
          "_tag": "NonLeaf",
          "forest": [
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "s4",
              "_tag": "Leaf"
            }
          ]
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": "Array",
      "_tag": "NonLeaf",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Record",
          "_tag": "NonLeaf",
          "forest": [
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "Record",
              "_tag": "NonLeaf",
              "forest": [
                {
                  "_id": "@parischap/effect-lib/Tree/",
                  "value": "Array",
                  "_tag": "NonLeaf",
                  "forest": [
                    {
                      "_id": "@parischap/effect-lib/Tree/",
                      "value": "s5",
                      "_tag": "Leaf"
                    }
                  ]
                }
              ]
            },
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "s6",
              "_tag": "Leaf"
            }
          ]
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "s7",
          "_tag": "Leaf"
        }
      ]
    }
  ]
}`);
	});

	it('unfoldAndFold', () => {
		expect(
			pipe(
				nonCyclicalObject1,
				MTree.unfoldAndFold({
					unfold: unfoldObject,
					foldNonLeaf,
					foldLeaf: Function.identity
				})
			)
		).toBe(foldedTestTree1);
	});

	describe('fold', () => {
		it('Non-cyclical value 1', () => {
			expect(pipe(testTree1, MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity }))).toBe(
				foldedTestTree1
			);
		});

		it('Non-cyclical value 2', () => {
			expect(pipe(testTree3, MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity }))).toBe(
				'{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5] }, s6 }, s7, { { s1, s2 }, s3 }] }'
			);
		});

		it('Cyclical value', () => {
			expect(pipe(testTree4, MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity }))).toBe(
				'{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5, Cyclical Array] }, s6 }, s7] }'
			);
		});
	});

	it('mapAccum', () => {
		expect(
			pipe(
				testTree1,
				MTree.mapAccum({
					accum: 0,
					fNonLeaf: (accum, a) => [accum + (a === 'Array' ? 1 : 2), a],
					fLeaf: (accum, b) => b + ' ' + accum.toString()
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe('{ [{ { s1 7, s2 7 }, s3 5 }, [s4 4]], [{ { [s5 8] }, s6 5 }, s7 3] }');
	});

	it('map', () => {
		expect(
			pipe(
				testTree1,
				MTree.map({
					fNonLeaf: (a) => (a === 'Array' ? 'Record' : 'Array'),
					fLeaf: MString.append('@')
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(mappedTestTree1);
	});

	it('reduce', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduce({
					z: 3,
					fNonLeaf: (z, a) => z + (a === 'Array' ? 1 : 2),
					fLeaf: (z, a) => z + a.length
				})
			)
		).toBe(31);
	});

	it('reduceRight', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduceRight({
					z: 3,
					fNonLeaf: (z, a) => z + (a === 'Array' ? 1 : 2),
					fLeaf: (z, a) => z + a.length
				})
			)
		).toBe(31);
	});

	it('extendDown', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendDown({
					fNonLeaf: (a) => (a.value === 'Array' ? 'Record' : 'Array'),
					fLeaf: flow(MTree.Leaf.value, MString.append('@'))
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(mappedTestTree1);
	});

	it('extendUp', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendUp({
					fNonLeaf: (a) => (a.value === 'Array' ? 'Record' : 'Array'),
					fLeaf: flow(MTree.Leaf.value, MString.append('@'))
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(mappedTestTree1);
	});
});
