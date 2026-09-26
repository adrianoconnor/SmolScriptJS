import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';


export default defineConfig({
  files: ['src/*.{js,ts}', 'tests/*.{js,ts}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
  ],
  languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: {
        },
        tsconfigRootDir: import.meta.dirname,
      },
  },
});


