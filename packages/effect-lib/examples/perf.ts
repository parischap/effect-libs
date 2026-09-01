import * as DateTime from 'effect/DateTime';

import * as MDateTime from '@parischap/effect-lib/MDateTime';

// Warming-up
MDateTime.fromParts({ year: 2025 });
DateTime.makeZoned(new Date(), { timeZone: 'Europe/London' });

const start = performance.now();
MDateTime.getYear(MDateTime.fromPartsOrThrow({ year: 2025 }));
const end = performance.now();
console.log(end - start);

const start1 = performance.now();
DateTime.getPart(DateTime.makeZonedUnsafe(new Date(), { timeZone: 'Europe/London' }), 'year');
const end1 = performance.now();
console.log(end1 - start1);
