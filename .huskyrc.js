module.exports = {
  hooks: {
    'pre-commit': 'lint-staged && npm run build',
    'pre-push': 'git pull',
  },
};
