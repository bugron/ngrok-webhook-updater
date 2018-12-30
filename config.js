require('dotenv').config();

const {
  GITHUB_TOKEN,
  SECRET_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  KILL_CONNECTION,
  PORT
} = process.env;

module.exports = {
  GITHUB_TOKEN,
  SECRET_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  KILL_CONNECTION: KILL_CONNECTION === 'true' ? true : false,
  PORT: PORT || 5000
};
