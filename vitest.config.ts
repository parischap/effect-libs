/* Although it is possible to have the vitest configuration inside the vite configuration files, this is usually not a good idea. The vite configuration is useful for bundling whereas the vitest configuration is useful for testing */
import { defineConfig } from 'vitest/config';
import { packagesFolderName } from '../../../shared-utils/constants.js';

export default defineConfig({
  test: {
    projects: [`${packagesFolderName}/*`],
  },
});
