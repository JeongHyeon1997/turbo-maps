import root from '../../eslint.config.mjs';

/**
 * Mobile ESLint config. Uses the root shared rules. We intentionally don't
 * extend `eslint-config-expo` here — it drags in a lot of legacy-config peer
 * plugins (eslint-plugin-import, etc.) that don't play well with flat config.
 * Add framework-specific rules inline when a real need shows up.
 */
export default [
  ...root,
  {
    ignores: ['.expo/**', 'expo-env.d.ts', 'babel.config.js', 'metro.config.js'],
  },
];
