const {
  GITHUB_TOKEN,
  SECRET_TOKEN,
  REPO_OWNER,
  REPO_NAME,
} = require('./config');

module.exports = {
  init() {
    if (!REPO_OWNER || !REPO_NAME) {
      throw new Error('REPO_OWER and REPO_NAME environment variables should be set!');
    }

    if (!GITHUB_TOKEN) {
      throw new Error([
        'A GitHub token must be specified in environment variables',
        'as the value of "GITHUB_TOKEN".',
        'This has to be a token with a scope of',
        '"admin:repo_hook" to be able to change Webhook\'s URL.'
      ].join('\n'));
    }

    if (!SECRET_TOKEN) {
      throw new Error(
        'A SECRET token must be specified in environment variables \n' +
        'as the value of "SECRET_TOKEN" to secure the webhook connection.'
      );
    }
  }
};
