/*class A extends Schema.Class<A>('A')({ a: Schema.String, b: Schema.String }) {}

const a = A.make({ a: 'a', b: 'b' });
const iso = Schema.toIso(A);

const get = iso.get(a);
const set = iso.set({ a: 'a', b: 'c' });

console.log(get);
console.log(set);*/

import { Schema } from 'effect';

import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MSchema from '@parischap/effect-lib/MSchema';
import * as MTemplate from '@parischap/effect-lib/MTemplate';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

const ph = MTemplatePlaceholder;
const sep = MTemplateSeparator;

// "#name is a #age-year old #kind."
const template = MTemplate.make(
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  sep.make(' is a '),
  ph.number({ name: 'age', numberBase10Format: MNumberBase10Format.unsignedInteger }),
  sep.make('-year old '),
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  sep.dot,
);
const a = MSchema.Template(template);
// { name: 'Jon', age: 24, kind: 'dog' }
console.log(Schema.decodeSync(MSchema.Template(template))('Jon is a 24-year old dog.'));
