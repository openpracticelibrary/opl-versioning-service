const {config} = require('./config');

const githubApi = new Octokit({
  auth: config.pat,
  userAgent: "opl-test-app",
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
});

module.exports = githubApi