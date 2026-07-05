import root from '../../eslint.config.mjs';

export default [
  ...root,
  {
    files: ['src/**/*.ts'],
    rules: {
      // NestJS decorator metadata requires many "types" to be imported as
      // values (e.g. @Inject(SomeClass) needs SomeClass at runtime). Turning
      // this off avoids false positives and accidental runtime breakage.
      '@typescript-eslint/consistent-type-imports': 'off',
      // Controllers commonly have decorator-only methods without `this` use.
      'class-methods-use-this': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
