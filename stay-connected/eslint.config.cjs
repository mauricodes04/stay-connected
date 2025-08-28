// eslint.config.cjs — Flat config for Expo RN + TS (ESLint v9)
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');

module.exports = [
  js.configs.recommended,

  // TS rules for project files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // RN helpers
      'react-native/no-inline-styles': 'off',
      'react-native/no-unused-styles': 'warn',
      'react-native/no-color-literals': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-undef': 'off',

      // Block stray Firebase auth initializers by default
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase/auth',
              importNames: ['getAuth', 'initializeAuth'],
              message:
                'Use { auth } from "@/lib/firebase" (singleton) instead of getAuth/initializeAuth.',
            },
            {
              name: 'firebase/auth/react-native',
              message: 'Do not import from firebase/auth/react-native.',
            },
          ],
        },
      ],
    },
  },

  // ✅ Override: allow initializeAuth/getAuth ONLY inside the singleton file
  {
    files: ['src/lib/firebase.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // Ignore config & build artifacts (prevents parser/project errors and “require” flags)
  {
    files: ['eslint.config.cjs', 'babel.config.js', 'metro.config.js', '*.d.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'nvm-windows/**',
      '**/*.d.ts',
    ],
  },
];
