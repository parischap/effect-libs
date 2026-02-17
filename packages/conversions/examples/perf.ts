import * as CVDateTime from '@parischap/conversions/CVDateTime'
import * as DateTime from 'effect/DateTime'

// Warming-up
CVDateTime.fromParts({ year: 2025 });
DateTime.makeZoned(new Date(), { timeZone: 'Europe/London' });

const start = performance.now();
CVDateTime.getYear(CVDateTime.fromPartsOrThrow({ year: 2025 }));
const end = performance.now();
console.log(end - start);

const start1 = performance.now();
DateTime.getPart(DateTime.unsafeMakeZoned(new Date(), { timeZone: 'Europe/London' }), 'year');
const end1 = performance.now();
console.log(end1 - start1);
