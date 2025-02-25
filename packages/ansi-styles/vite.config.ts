import type { UserConfig } from 'vite';

export default {
	test: {
		include: ['./tests/*.test.ts'],
		isolate: false,
		fileParallelism: false,
		pool: 'threads'
	}
} satisfies UserConfig;
