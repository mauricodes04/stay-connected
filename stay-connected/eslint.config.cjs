// eslint.config.cjs — Flat config for Expo RN + TypeScript (ESLint v9)
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');

module.exports = [
  // Base JS rules
  js.configs.recommended,

  // TypeScript support (keeps config lean; uses TS parser automatically)
  ...tseslint.configs.recommendedTypeChecked, // requires "project" in tsconfig
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },

  // React Hooks + React Native
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    rules: {
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // RN best practices
      'react-native/no-inline-styles': 'off',
      'react-native/no-unused-styles': 'warn',
      'react-native/no-color-literals': 'off',

      // 🔒 Guardrail: block stray Firebase auth initializers
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

  // Ignore folders
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.expo/**',
      'android/**',
      'ios/**',
    ],
  },
];
