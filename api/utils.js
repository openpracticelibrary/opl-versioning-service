const githubApi = require("../config/githubConfig");
const config = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

exports.createNewBranch = async function createNewBranch(ref, lastCommitSha) {
  return githubApi.git.createRef({
    owner: config.org,
    repo: config.repo,
    ref: ref,
    sha: lastCommitSha,
  });
};

exports.checkIfExistingPractice = async function checkIfExistingPractice(slug) {
  try {
    const {
      data: { sha },
    } = await githubApi.repos.getContent({
      owner: config.org,
      repo: config.repo,
      path: slug + ".json",
      ref: config.base,
    });
    return sha;
  } catch (err) {
    return null;
  }
};

exports.getLatestCommitOnMaster = async function getLatestCommitOnMaster() {
  const {
    data: { sha },
  } = await githubApi.repos.getCommit({
    owner: config.org,
    repo: config.repo,
    ref: config.base,
  });

  return sha;
};

exports.createRefString = function createRefString(user, practice) {
  return "refs/heads/" + user.username + "_" + practice.slug + "_" + uuidv4();
};

exports.getPullRequest = async function getPullRequest(pullRequestNumber) {
  return githubApi.pulls.get({
    owner: config.org,
    repo: config.repo,
    pull_number: pullRequestNumber,
  });
};

exports.getCommit = async function getCommit(commitSha) {
  return githubApi.repos.getCommit({
    owner: config.org,
    repo: config.repo,
    ref: commitSha,
  });
};

exports.getContent = async function getContent(commitSha) {
  return githubApi.repos.getContent({
    owner: config.org,
    repo: config.repo,
    ref: commitSha,
  });
};

exports.getRawDownloadLink = function getRawDownloadLink(slug, commitSha) {
  return `https://raw.githubusercontent.com/${config.org}/${config.repo}/${commitSha}/${slug}.json`;
};

exports.getPracticeFromCommit = async function getPracticeFromCommit(
  slug,
  commitSha
) {
  const download_link = exports.getRawDownloadLink(slug, commitSha);

  const token_config = {
    headers: { Authorization: `Bearer ${config.pat}` },
  };

  const { data } = await axios.get(download_link, token_config);
  return data;
};

exports.addSlugToPullRequest = async function addSlugToPullRequest(
  slug,
  pullRequestNumber
) {
  return githubApi.issues.addLabels({
    owner: config.org,
    repo: config.repo,
    issue_number: pullRequestNumber,
    labels: ["practice:" + slug],
  });
};

exports.extractPracticeFromLabelsOnPullRequest = function extractPracticeFromLabelsOnPullRequest(
  labels
) {
  const { name } = labels.find(label => label.name.startsWith("practice:"));
  return name.trim().split(":").slice(-1)[0];
};

exports.getPracticeFromPullRequest = async function getPracticeFromPullRequest(
  pullRequestNumber
) {
  const {
    data: { labels },
  } = await exports.getPullRequest(pullRequestNumber);
  return exports.extractPracticeFromLabelsOnPullRequest(labels);
};

exports.mergePullRequest = async function mergePullRequest(pullRequestNumber) {
  return githubApi.pulls.merge({
    owner: config.org,
    repo: config.repo,
    pull_number: pullRequestNumber,
  });
};

exports.deleteBranch = async function deleteBranch(branch) {
  return githubApi.git.deleteRef({
    owner: config.org,
    repo: config.repo,
    ref: "heads/" + branch,
  });
};

exports.updateChangeWithLatest = async function updateChangeWithLatest(
  pullRequestNumber
) {
  return githubApi.pulls.updateBranch({
    owner: config.org,
    repo: config.repo,
    pull_number: pullRequestNumber,
  });
};

exports.closePullRequest = async function updatePullRequest(pullRequestNumber) {
  return githubApi.pulls.update({
    owner: config.org,
    repo: config.repo,
    pull_number: pullRequestNumber,
    state: "closed",
  });
};

exports.getAllPullRequests = async function getAllPullRequests() {
  return githubApi.pulls.list({
    owner: config.org,
    repo: config.repo,
    state: "open",
    sort: "created",
  });
};

exports.determineMergeableStatus = async function determineMergeableStatus(
  pullRequestNumber
) {
  try {
    await exports.updateChangeWithLatest(pullRequestNumber);
    return true;
  } catch (err) {
    return false;
  }
};

exports.getDiffFromPullRequest = async function getDiffFromPullRequest(
  pullRequestNumber
) {
  const {
    data: { url },
  } = await exports.getPullRequest(pullRequestNumber);

  const token_config = {
    headers: {
      Authorization: `Bearer ${config.pat}`,
      Accept: "application/vnd.github.v3.diff",
    },
  };
  const { data } = await axios.get(url + ".diff", token_config);
  return data;
};
