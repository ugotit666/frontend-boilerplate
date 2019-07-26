module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/babel', 'prettier/react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.dev.config.js',
      },
    },
  },
  plugins: ['babel', 'react', 'prettier'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    'prettier/prettier': 'error',
  },
};
