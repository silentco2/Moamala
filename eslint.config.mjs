import nx from '@nx/eslint-plugin';

const scopes = ['applicant', 'requests', 'review', 'admin', 'notifications', 'audit'];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/mockServiceWorker.js'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Layering by type
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:util', 'type:model'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:model'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:model'],
            },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util', 'type:model'] },
            { sourceTag: 'type:model', onlyDependOnLibsWithTags: ['type:model'] },
            { sourceTag: 'type:mocks', onlyDependOnLibsWithTags: ['type:model'] },
            // Isolation by scope
            { sourceTag: 'scope:portal', onlyDependOnLibsWithTags: ['*'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'scope:core', onlyDependOnLibsWithTags: ['scope:shared', 'scope:core'] },
            { sourceTag: 'scope:mocks', onlyDependOnLibsWithTags: ['scope:shared', 'scope:mocks'] },
            ...scopes.map((scope) => ({
              sourceTag: `scope:${scope}`,
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:core', `scope:${scope}`],
            })),
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
