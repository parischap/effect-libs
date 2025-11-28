#!/usr/bin/env node
/**
 * Equivalent to the shell rm -rf command: removes a path (file or directory with all its contents).
 * Does not fail if the path does not exist
 */
import { rmSync } from 'node:fs';
const fileToDelete = process.argv[2];
if (fileToDelete === undefined) throw new Error('Expected 1 argument. Received 0');
rmSync(fileToDelete, { force: true, recursive: true });
