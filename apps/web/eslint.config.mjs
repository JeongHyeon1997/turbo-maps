import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import root from '../../eslint.config.mjs';

/**
 * Web ESLint config. Uses @next/eslint-plugin-next directly as a flat-config
 * plugin (skipping FlatCompat + eslint-config-next bridge which pulls in
 * legacy-format configs incompatible with ESLint 9 flat config).
 */
export default [
  ...root,
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
