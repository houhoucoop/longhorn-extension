module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation update
        'style', // Code style (formatting, no functional changes)
        'refactor', // Refactor (neither new feature nor bug fix)
        'perf', // Performance optimization
        'test', // Add tests
        'chore', // Build process or auxiliary tools changes
        'revert', // Revert previous commit
        'build', // Build system or external dependencies changes
        'ci', // CI configuration files and scripts changes
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
