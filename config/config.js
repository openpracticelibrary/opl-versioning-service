module.exports = {
    pat: process.env.GITHUB_PAT,
    org: process.env.GITHUB_ORG || "openpracticelibrary",
    repo: process.env.GITHUB_REPO || "opl-test-data-versioning",
    base: process.env.GITHUB_BASE_REF || "master",
  };