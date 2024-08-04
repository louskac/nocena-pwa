module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // Add any specific rules you want to override here
    'no-restricted-globals': ['error', 'self'],
  },
  globals: {
    BigInt: 'readonly',
    SharedArrayBuffer: 'readonly',
    PublicKey: "readonly"
  },
};
