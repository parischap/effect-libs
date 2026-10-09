import { Schema } from 'effect';

const Person1 = Schema.Struct({
  id: Schema.Finite,
  displayName: Schema.String,
}).pipe(Schema.overrideToEquivalence(() => (self, that) => self.id === that.id));

const p3 = Person1.make({ id: 1, displayName: 'J' });
const p4 = Person1.make({ id: 1, displayName: 'A' });

class Person extends Schema.Class<Person>('Person')(Person1) {}

const p1 = new Person({ id: 1, displayName: 'J' });
const p2 = new Person({ id: 1, displayName: 'A' });

const equivalence = Schema.toEquivalence(Person);
console.log(equivalence(p1, p3));
