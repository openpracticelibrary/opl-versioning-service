const config = require("./config");
const { Octokit } = require("@octokit/rest");

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

module.exports = githubApi;
