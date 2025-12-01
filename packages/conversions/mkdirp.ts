#!/usr/bin/env node
/**
 * Equivalent to the shell mkdir -p command: creates a directory with all necessary parent
 * directories
 */
import { mkdirSync } from 'node:fs';
const dirToCreate = process.argv[2];
if (dirToCreate === undefined) throw new Error('Expected 1 argument. Received 0');
/* eslint-disable-next-line  functional/no-expression-statements */
mkdirSync(dirToCreate, { recursive: true });