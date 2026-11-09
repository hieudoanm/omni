import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    // Vendored from hieudoanm.github.io docs app — keep its own lint baseline.
    files: [
      'src/components/**',
      'src/app/apps/**',
      'src/data/**',
      'src/json/**',
      'src/services/**',
      'src/content/**',
      'src/examples/**',
      'src/lib/**',
      'src/hooks/useSWRegister.ts',
      'src/utils/canvas.ts',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
]);

export default eslintConfig;
