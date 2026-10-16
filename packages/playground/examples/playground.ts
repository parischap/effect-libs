import * as Schema from 'effect/Schema';

import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
import * as MSchema from '@parischap/effect-lib/MSchema';

class A extends Schema.Class<A>('A')({ a: Schema.String, b: Schema.String }) {}

const a = A.make({ a: 'a', b: 'b' });
const iso = Schema.toIso(A);

const get = iso.get(a);
const set = iso.set({ a: 'a', b: 'c' });

console.log(get);
console.log(set);

const Toto = Schema.Struct({
  a: Schema.NumberFromString,
  b: MSchema.DateTimeFromString(MDateTimeFormat.euDotDate, MDateTimeContext.enGB),
});

console.log(JSON.stringify(Schema.toJsonSchemaDocument(Toto), null, 2));
