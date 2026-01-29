import { ASStyle, ASText } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { MPredicate } from '@parischap/effect-lib';
import {
  PPByPasser,
  PPMarkShowerConstructor,
  PPOption,
  PPPropertyFilter,
  PPStringifiedValue,
  PPValue,
  PPValueBasedStylerConstructor,
  PPValueOrder,
} from '@parischap/pretty-print';
import { Array, HashMap, HashSet, Option, pipe, Predicate } from 'effect';
import { describe, it } from 'vitest';

describe('Option', () => {
  describe('NonPrimitive', () => {
    const { record } = PPOption.NonPrimitive;
    describe('Prototype and guards', () => {
      describe('Equal.equals', () => {
        it('Matching', () => {
          TestUtils.assertEquals(record, PPOption.NonPrimitive.make(record));
        });

        it('Non-matching', () => {
          TestUtils.assertNotEquals(record, PPOption.NonPrimitive.array);
        });
      });

      it('.toString()', () => {
        TestUtils.strictEqual(record.toString(), `Object`);
      });

      it('.pipe()', () => {
        TestUtils.strictEqual(record.pipe(PPOption.NonPrimitive.id), 'Object');
      });

      describe('has', () => {
        it('Matching', () => {
          TestUtils.assertTrue(PPOption.NonPrimitive.has(record));
        });
        it('Non matching', () => {
          TestUtils.assertFalse(PPOption.NonPrimitive.has(new Date()));
        });
      });
    });

    describe('Initialized', () => {
      describe('toHeaderMarkShower', () => {
        const value = PPValue.fromTopValue(3);
        const differingPropertyNumbers = { allPropertyNumber: 5, actualPropertyNumber: 3 };
        const equalPropertyNumbers = { allPropertyNumber: 3, actualPropertyNumber: 3 };
        const utilInspectLike = PPOption.darkModeUtilInspectLike;
        const valueBasedStylerConstructor =
          PPValueBasedStylerConstructor.fromOption(utilInspectLike);
        const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
        const constructors = {
          valueBasedStylerConstructor,
          markShowerConstructor,
        };
        const fromNonPrimitive = PPOption.NonPrimitive.Initialized.fromNonPrimitive(constructors);
        const nonPrimitiveMake = PPOption.NonPrimitive.make;

        it('showId = false, propertyNumberDisplayOption = None', () => {
          const headerMarkShower = fromNonPrimitive(
            PPOption.NonPrimitive.record,
          ).toHeaderMarkShower(differingPropertyNumbers);
          TestUtils.assertTrue(pipe(value, headerMarkShower, ASText.isEmpty));
        });

        it('showId = false, propertyNumberDisplayOption = All', () => {
          const headerMarkShower = pipe(
            {
              ...PPOption.NonPrimitive.record,
              propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.All,
            },
            nonPrimitiveMake,
            fromNonPrimitive,
          ).toHeaderMarkShower(differingPropertyNumbers);
          TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('(5) '));
        });

        it('showId = false, propertyNumberDisplayOption = Actual', () => {
          const headerMarkShower = pipe(
            {
              ...PPOption.NonPrimitive.record,
              propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.Actual,
            },
            nonPrimitiveMake,
            fromNonPrimitive,
          ).toHeaderMarkShower(differingPropertyNumbers);
          TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('(3) '));
        });

        it('showId = false, propertyNumberDisplayOption = AllAndActual', () => {
          const headerMarkShower = pipe(
            {
              ...PPOption.NonPrimitive.record,
              propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual,
            },
            nonPrimitiveMake,
            fromNonPrimitive,
          ).toHeaderMarkShower(equalPropertyNumbers);
          TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('(3,3) '));
        });

        describe('showId = false, propertyNumberDisplayOption = AllAndActualIfDifferent', () => {
          it('With equal property numbers', () => {
            const headerMarkShower = pipe(
              {
                ...PPOption.NonPrimitive.record,
                propertyNumberDisplayOption:
                  PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent,
              },
              nonPrimitiveMake,
              fromNonPrimitive,
            ).toHeaderMarkShower(equalPropertyNumbers);
            TestUtils.assertTrue(pipe(value, headerMarkShower, ASText.isEmpty));
          });

          it('With differing property numbers', () => {
            const headerMarkShower = pipe(
              {
                ...PPOption.NonPrimitive.record,
                propertyNumberDisplayOption:
                  PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent,
              },
              nonPrimitiveMake,
              fromNonPrimitive,
            ).toHeaderMarkShower(differingPropertyNumbers);
            TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('(5,3) '));
          });
        });

        it('showId = true, propertyNumberDisplayOption = None', () => {
          const headerMarkShower = pipe(
            {
              ...PPOption.NonPrimitive.record,
              showId: true,
              propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.None,
            },
            nonPrimitiveMake,
            fromNonPrimitive,
          ).toHeaderMarkShower(differingPropertyNumbers);
          TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('Object '));
        });

        it('showId = true, propertyNumberDisplayOption = AllAndActual', () => {
          const headerMarkShower = pipe(
            {
              ...PPOption.NonPrimitive.record,
              showId: true,
              propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual,
            },
            nonPrimitiveMake,
            fromNonPrimitive,
          ).toHeaderMarkShower(differingPropertyNumbers);
          TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('Object(5,3) '));
        });

        describe('showId = true, propertyNumberDisplayOption = AllAndActualIfDifferent', () => {
          it('With differing property numbers', () => {
            const headerMarkShower = pipe(
              {
                ...PPOption.NonPrimitive.record,
                showId: true,
                propertyNumberDisplayOption:
                  PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent,
              },
              nonPrimitiveMake,
              fromNonPrimitive,
            ).toHeaderMarkShower(differingPropertyNumbers);
            TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('Object(5,3) '));
          });

          it('With equal property numbers', () => {
            const headerMarkShower = pipe(
              {
                ...PPOption.NonPrimitive.record,
                showId: true,
                propertyNumberDisplayOption:
                  PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent,
              },
              nonPrimitiveMake,
              fromNonPrimitive,
            ).toHeaderMarkShower(equalPropertyNumbers);
            TestUtils.assertEquals(pipe(value, headerMarkShower), ASStyle.green('Object '));
          });
        });
      });
    });
  });

  describe('Tag, prototype and guards', () => {
    const { utilInspectLike } = PPOption;

    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), PPOption.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(utilInspectLike, PPOption.make(utilInspectLike));
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(utilInspectLike, PPOption.darkModeUtilInspectLike);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(utilInspectLike.pipe(PPOption.id), 'UtilInspectLike');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPOption.has(utilInspectLike));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPOption.has(new Date()));
      });
    });
  });

  describe('toStringifier', () => {
    const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);
    const stringifierWithoutFunctionByPasserShowingPrototype = PPOption.toStringifier(
      PPOption.make({
        ...PPOption.utilInspectLike,
        id: 'WithoutFunctionByPasser',
        byPassers: Array.of(PPByPasser.objectToString),
        generalNonPrimitiveOption: {
          ...PPOption.NonPrimitive.record,
          propertyFilters: Array.of(
            PPPropertyFilter.removeNotFulfillingKeyPredicateMaker({
              id: 'keepAAndLength',
              predicate: Predicate.or(
                MPredicate.strictEquals('a'),
                MPredicate.strictEquals('length'),
              ),
            }),
          ),
          maxPrototypeDepth: Infinity,
        },
      }),
    );
    const stringifierWithInfiniteMaxDepth = PPOption.toStringifier(
      PPOption.make({ ...PPOption.utilInspectLike, id: 'NoDepthLimit', maxDepth: Infinity }),
    );
    const stringifierWithLimitedPropertiesShowPropNumber = PPOption.toStringifier(
      PPOption.make({
        ...PPOption.utilInspectLike,
        id: 'WithModifiedNonPrimitiveOptions',
        generalNonPrimitiveOption: {
          ...PPOption.NonPrimitive.record,
          maxPropertyNumber: 2,
          propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual,
        },
      }),
    );
    const stringifierWithSortedProperties = PPOption.toStringifier(
      PPOption.make({
        ...PPOption.utilInspectLike,
        id: 'WithModifiedNonPrimitiveOptions',
        generalNonPrimitiveOption: {
          ...PPOption.NonPrimitive.record,
          propertySortOrder: Option.some(PPValueOrder.byOneLineStringKey),
        },
      }),
    );

    const fooFunction = Object.assign(
      function foo(n: number) {
        return n + 1;
      },
      { a: 1 },
    );

    describe('Check bypasser handling', () => {
      it('With function', () => {
        TestUtils.deepStrictEqual(
          pipe(fooFunction, stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of('[Function: foo]'),
        );
      });

      it('With date', () => {
        const dummy = new Date(0);
        TestUtils.deepStrictEqual(
          pipe(dummy, stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of(dummy.toString()),
        );
      });
    });

    it('Check primitive handling', () => {
      TestUtils.deepStrictEqual(
        pipe(5, stringifier, PPStringifiedValue.toUnstyledStrings),
        Array.of('5'),
      );
    });

    describe('Check maxDepth handling', () => {
      it('With object', () => {
        TestUtils.strictEqual(
          pipe({ a: { a: { a: 1 } } }, stringifier, PPStringifiedValue.toAnsiString()),
          pipe(
            ASStyle.red(
              '{ a',
              ASStyle.white(': '),
              ASStyle.green('{ '),
              'a',
              ASStyle.white(': '),
              ASStyle.green('[Object] }'),
              ' }',
            ),
            ASText.toAnsiString,
          ),
        );
      });

      it('With map', () => {
        TestUtils.deepStrictEqual(
          pipe({ a: { a: new Map() } }, stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of('{ a: { a: [Map] } }'),
        );
      });
    });

    describe('Check circularity handling', () => {
      it('Simple example with color', () => {
        const circular = { a: 1 as unknown };
        circular.a = circular;

        TestUtils.strictEqual(
          pipe(circular, stringifier, PPStringifiedValue.toAnsiString()),
          pipe(
            ASStyle.green(
              '<Ref *1> ',
              ASStyle.red('{ a'),
              ASStyle.white(': '),
              ASStyle.green('[Circular *1]'),
              ASStyle.red(' }'),
            ),
            ASText.toAnsiString,
          ),
        );
      });

      it('More complex example without color', () => {
        const circular = { a: 1 as unknown, b: { inner: 1 as unknown, circular: 1 as unknown } };
        circular.a = [circular];
        circular.b.inner = circular.b;
        circular.b.circular = circular;
        TestUtils.deepStrictEqual(
          pipe(circular, stringifierWithInfiniteMaxDepth, PPStringifiedValue.toUnstyledStrings),
          [
            '<Ref *1> {',
            '  a: [ [Circular *1] ],',
            '  b: <Ref *2> { inner: [Circular *2], circular: [Circular *1] }',
            '}',
          ],
        );
      });
    });

    describe('Check non-primitive handling', () => {
      it('Empty array', () => {
        TestUtils.deepStrictEqual(
          pipe([], stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of('[]'),
        );
      });

      it('Empty record', () => {
        TestUtils.deepStrictEqual(
          pipe({}, stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of('{}'),
        );
      });

      it('Simple array', () => {
        TestUtils.deepStrictEqual(
          pipe([3, 4], stringifier, PPStringifiedValue.toUnstyledStrings),
          Array.of('[ 3, 4 ]'),
        );
      });

      it('Nested objects and arrays', () => {
        const map = new Map();
        map.set({ mapA: 1, mapB: 2 }, 1);
        map.set({ mapA: 6, mapB: 5 }, 3);
        const test = {
          c: { e: ['a', 'b'], d: [3, 4], a: map },
          a: ['r', { c: HashSet.make(new Uint8Array(3), new Uint8Array(3)) }],
          b: 't',
        };
        TestUtils.deepStrictEqual(
          pipe(test, stringifierWithInfiniteMaxDepth, PPStringifiedValue.toUnstyledStrings),
          Array.make(
            '{',
            '  c: {',
            "    e: [ 'a', 'b' ],",
            '    d: [ 3, 4 ],',
            '    a: Map { { mapA: 1, mapB: 2 } => 1, { mapA: 6, mapB: 5 } => 3 }',
            '  },',
            "  a: [ 'r', { c: EffectHashSet { Uint8Array { 0, 0, 0 }, Uint8Array { 0, 0, 0 } } } ],",
            "  b: 't'",
            '}',
          ),
        );
      });

      it('Show property number when necessary', () => {
        TestUtils.deepStrictEqual(
          pipe(
            { b: 1, a: 2, c: 3 },
            stringifierWithLimitedPropertiesShowPropNumber,
            PPStringifiedValue.toUnstyledStrings,
          ),
          Array.make('(3,2) { b: 1, a: 2 }'),
        );
      });

      it('Sort properties', () => {
        TestUtils.deepStrictEqual(
          pipe(
            { b: 1, a: 2, c: 3 },
            stringifierWithSortedProperties,
            PPStringifiedValue.toUnstyledStrings,
          ),
          Array.make('{ a: 2, b: 1, c: 3 }'),
        );
      });

      it('Unbypassed function with some prototype properties', () => {
        TestUtils.deepStrictEqual(
          pipe(
            fooFunction,
            stringifierWithoutFunctionByPasserShowingPrototype,
            PPStringifiedValue.toUnstyledStrings,
          ),
          Array.of('{ length: 1, a: 1, length@: 0 }'),
        );
      });

      describe('Treeify', () => {
        const toTreeify = {
          A: {
            A1: {
              A11: null,
              A12: [{ A121: null, A122: null, A123: null }, { A124: null }],
              A13: null,
            },
            A2: null,
            A3: null,
          },
          B: HashMap.make(['B1', null], ['B2', null]),
        };
        it('Show leaves', () => {
          TestUtils.deepStrictEqual(
            pipe(
              toTreeify,
              PPOption.toStringifier(PPOption.treeify),
              PPStringifiedValue.toUnstyledStrings,
            ),
            [
              '├─ A',
              '│  ├─ A1',
              '│  │  ├─ A11: null',
              '│  │  ├─ A12',
              '│  │  │  ├─ 0',
              '│  │  │  │  ├─ A121: null',
              '│  │  │  │  ├─ A122: null',
              '│  │  │  │  └─ A123: null',
              '│  │  │  └─ 1',
              '│  │  │     └─ A124: null',
              '│  │  └─ A13: null',
              '│  ├─ A2: null',
              '│  └─ A3: null',
              '└─ B',
              '   ├─ B2 => null',
              '   └─ B1 => null',
            ],
          );
        });

        it('Hide leaves', () => {
          TestUtils.deepStrictEqual(
            pipe(
              toTreeify,
              PPOption.toStringifier(PPOption.treeifyHideLeaves),
              PPStringifiedValue.toUnstyledStrings,
            ),
            [
              '├─ A',
              '│  ├─ A1',
              '│  │  ├─ A11',
              '│  │  ├─ A12',
              '│  │  │  ├─ 0',
              '│  │  │  │  ├─ A121',
              '│  │  │  │  ├─ A122',
              '│  │  │  │  └─ A123',
              '│  │  │  └─ 1',
              '│  │  │     └─ A124',
              '│  │  └─ A13',
              '│  ├─ A2',
              '│  └─ A3',
              '└─ B',
              '   ├─ B2',
              '   └─ B1',
            ],
          );
        });
      });
    });
  });
});
