import { CVDateTime } from '@parischap/conversions';
import { DateTime } from 'effect';

const now = Date.now();
const dummy = CVDateTime.fromParts({ year: 2025 });
const dummy1 = DateTime.makeZoned(new Date(), { timeZone: 'Europe/London' });

const start = performance.now();
const a = CVDateTime.getYear(CVDateTime.unsafeFromParts({ year: 2025 }));
const end = performance.now();
console.log(end - start);

const start1 = performance.now();
const a1 = DateTime.getPart(
	DateTime.unsafeMakeZoned(new Date(), { timeZone: 'Europe/London' }),
	'year'
);
const end1 = performance.now();
console.log(end1 - start1);
