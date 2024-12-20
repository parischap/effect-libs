/* eslint-disable functional/no-expression-statements */
import { MMatch, MString, MTree, MTuple, MTypes, MUtils } from '@parischap/effect-lib';
import {
	Array,
	Either,
	Equal,
	flow,
	Function,
	Number,
	Option,
	pipe,
	String,
	Struct,
	Tuple
} from 'effect';
import { describe, expect, it } from 'vitest';

const splitBy = <S extends string>(
	sep: S
): MTypes.OneArgFunction<
	string,
	Option.Option<Either.Either<[S, MTypes.OverOne<string>], never>>
> =>
	flow(
		String.split(sep),
		Option.liftPredicate(MTypes.isOverTwo),
		Option.map(flow(Array.map(String.trim), Tuple.make, MTuple.prependElement(sep), Either.right))
	);

const unfold: MTypes.OneArgFunction<
	string,
	Either.Either<MTypes.Pair<'.' | ',' | ' ', MTypes.OverOne<string>>, string>
> = flow(
	MMatch.make,
	MMatch.tryFunction(splitBy('.')),
	MMatch.tryFunction(splitBy(',')),
	MMatch.tryFunction(splitBy(' ')),
	MMatch.orElse(Either.left)
);

const foldNonLeaf = (value: '.' | ',' | ' ', children: ReadonlyArray<string>): string =>
	Array.join(children, value + (value === ' ' ? '' : ' '));

const testSentence0 = 'Foo, Bat Bar. Baz Bar Foo';
const testSentence1 =
	'Foo goes fishing, Bat goes hunting. Baz prefers smimming, in a large pool, by his house';
const testSentence3 =
	'Foo goes fishing, Bat goes hunting. Baz prefers smimming, in a long pool, by his house';
const testSentence1Mapped =
	'Foo@ goes@ fishing@. Bat@ goes@ hunting@, Baz@ prefers@ smimming@. in@ a@ large@ pool@. by@ his@ house@';

const testTree0 = pipe(testSentence0, MTree.unfold(unfold));
const testTree1 = pipe(testSentence1, MTree.unfold(unfold));
const testTree2 = pipe(testSentence1, MTree.unfold(unfold));
const testTree3 = pipe(testSentence3, MTree.unfold(unfold));

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
			expect(testTree1.pipe(MTypes.isRecord)).toBe(true);
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

	describe('unfold and .toString()', () => {
		it('Non-cyclical test input', () => {
			expect(testTree0.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Tree/",
  "value": ".",
  "_tag": "NonLeaf",
  "forest": [
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": ",",
      "_tag": "NonLeaf",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Foo",
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": " ",
          "_tag": "NonLeaf",
          "forest": [
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "Bat",
              "_tag": "Leaf"
            },
            {
              "_id": "@parischap/effect-lib/Tree/",
              "value": "Bar",
              "_tag": "Leaf"
            }
          ]
        }
      ]
    },
    {
      "_id": "@parischap/effect-lib/Tree/",
      "value": " ",
      "_tag": "NonLeaf",
      "forest": [
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Baz",
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Bar",
          "_tag": "Leaf"
        },
        {
          "_id": "@parischap/effect-lib/Tree/",
          "value": "Foo",
          "_tag": "Leaf"
        }
      ]
    }
  ]
}`);
		});
	});

	it('unfoldAndFold', () => {
		expect(
			pipe(
				testSentence1,
				MTree.unfoldAndFold({
					unfold,
					foldNonLeaf,
					foldLeaf: Function.identity
				})
			)
		).toBe(testSentence1);
	});

	it('fold', () => {
		expect(pipe(testTree1, MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity }))).toBe(
			testSentence1
		);
	});

	it('map', () => {
		expect(
			pipe(
				testTree1,
				MTree.map({
					fNonLeaf: flow(
						MMatch.make,
						MMatch.whenIs('.', Function.constant(',' as const)),
						MMatch.whenIs(',', Function.constant('.' as const)),
						MMatch.orElse(Function.constant(' ' as const))
					),
					fLeaf: MString.append('@')
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(testSentence1Mapped);
	});

	it('reduce', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduce({
					z: 3,
					fNonLeaf: (acc, value) =>
						acc +
						(value === '.' ? 1
						: value === ',' ? 2
						: 0),
					fLeaf: Number.increment
				})
			)
		).toBe(24);
	});

	it('reduceRight', () => {
		expect(
			pipe(
				testTree1,
				MTree.reduceRight({
					z: 3,
					fNonLeaf: (z, value) =>
						z +
						(value === '.' ? 1
						: value === ',' ? 2
						: 0),
					fLeaf: Number.increment
				})
			)
		).toBe(24);
	});

	it('extendDown', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendDown({
					fNonLeaf: flow(
						Struct.get('value'),
						MMatch.make,
						MMatch.whenIs('.', Function.constant(',' as const)),
						MMatch.whenIs(',', Function.constant('.' as const)),
						MMatch.orElse(Function.constant(' ' as const))
					),
					fLeaf: flow(Struct.get('value'), MString.append('@'))
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(testSentence1Mapped);
	});

	it('extendUp', () => {
		expect(
			pipe(
				testTree1,
				MTree.extendUp({
					fNonLeaf: flow(
						Struct.get('value'),
						MMatch.make,
						MMatch.whenIs('.', Function.constant(',' as const)),
						MMatch.whenIs(',', Function.constant('.' as const)),
						MMatch.orElse(Function.constant(' ' as const))
					),
					fLeaf: flow(Struct.get('value'), MString.append('@'))
				}),
				MTree.fold({ fNonLeaf: foldNonLeaf, fLeaf: Function.identity })
			)
		).toBe(testSentence1Mapped);
	});
});
