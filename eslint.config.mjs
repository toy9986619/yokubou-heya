import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'functions/node_modules/**',
      'functions/lib/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Subscription-style hooks (Firebase onSnapshot) legitimately reset state
      // in the effect body when deps become invalid. React 19's new rule is too
      // strict for this pattern; the alternative (useSyncExternalStore with
      // async initial value) is overkill for a side project.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
