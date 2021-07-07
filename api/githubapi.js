const githubApi = require("../config/githubConfig");
const config = require("../config/config");
const utils = require("./utils");

/**
 * Propose a change
 * @param {Object} user - user proposing the change
 * @param {Object} practice - json practice object containing all fields
 *
 * @description
 * <ul>
 *  <li> Encode JSON Data </li>
 *  <li> Retrieve Last Commit from Master </li>
 *  <li> Create a new branch using last commit as head </li>
 *  <li> Check to see if content already exists in repo (i.e. is this an update to an existing practice or creation of a new practice) </li>
 *  <li> Create or update file contents on the branch </li>
 *  <li> Make PR from branch to master </li>
 *  <li> Label PR with the practice slug </li>
 *  <li> Associate User with PR in Content-Api-Service </li>
 * </ul>
 *
 */

exports.proposeChange = async function proposeChange(user, practice) {
  const encodedPractice = Buffer.from(
    JSON.stringify(practice, null, 2)
  ).toString("base64");

  const ref = utils.createRefString(user, practice);
  const lastCommitSha = await utils.getLatestCommitOnMaster();
  const newBranchResponse = await utils.createNewBranch(ref, lastCommitSha);

  const existingPracticeSha = await utils.checkIfExistingPractice(
    practice.slug
  );

  const fileUploadResponse = await githubApi.repos.createOrUpdateFileContents({
    owner: config.org,
    repo: config.repo,
    path: practice.slug + ".json",
    ...(existingPracticeSha !== null && { sha: existingPracticeSha }),
    branch: ref,
    message: "Proposed Change to " + practice.title + " by " + user.username,
    content: encodedPractice,
    committer: {
      name: user.username,
      email: user.email,
    },
    author: {
      name: user.username,
      email: user.email,
    },
  });

  const {
    data: { number },
  } = await githubApi.pulls.create({
    owner: config.org,
    repo: config.repo,
    title: "PR to " + practice.title + " by " + user.username,
    head: ref,
    base: config.base,
  });

  await utils.addSlugToPullRequest(practice.slug, number);

  return number;
};

/**
 * Get the proposed change and content
 * @param {int} pullRequestNumber - pull request associated with change
 *
 * @description
 * <ul>
 *  <li> Get Last Commit on Pull Request </li>
 *  <li> Get Practice on Pull Request from Label </li>
 *  <li> Retrieve JSON using Raw Github Link </li>
 * </ul>
 *
 */

exports.getProposedChange = async function getProposedChange(
  pullRequestNumber
) {
  const { data } = await utils.getPullRequest(pullRequestNumber);
  const commitSha = data.head.sha;
  const practice_slug = utils.extractPracticeFromLabelsOnPullRequest(
    data.labels
  );
  return utils.getPracticeFromCommit(practice_slug, commitSha);
};

/**
 *
 * Admin approves a PR
 *
 * @param {int} pullRequestNumber - pull request associated with change
 * @description
 * <ul>
 *  <li> Verify that the PR is mergeable </li>
 *  <li> Merge the PR </li>
 *  <li> Delete the branch associated with the PR  </li>
 * </ul>
 *
 * Things to Consider
 * 1. Do we need to sync latest changes with Strapi?
 */
exports.approveChange = async function approveChange(pullRequestNumber) {
  const { data } = await utils.getPullRequest(pullRequestNumber);
  if (data.mergeable) {
    await utils.mergePullRequest(pullRequestNumber);
    await utils.deleteBranch(data.head.ref);
    return true;
  }

  return false;
};

/**
 *
 * Admin rejects a PR
 *
 * @param {int} pullRequestNumber - pull request associated with change
 * @description
 * <ul>
 *  <li> Update the PR to be closed </li>
 *  <li> Delete the branch associated with the PR  </li>
 * </ul>
 *
 */
exports.rejectChange = async function rejectChange(pullRequestNumber) {
  const { data } = await utils.getPullRequest(pullRequestNumber);
  await utils.closePullRequest(pullRequestNumber);
  await utils.deleteBranch(data.head.ref);
  return true;
};


/**
 *
 * Admin gets all proposed changes
 *
 * @description
 * <ul>
 *  <li> get all PRs with an Open state </li>
 * </ul>
 *
 */
exports.getAllProposedChanges = async function getAllProposedChanges() {
  const {data} = await utils.getAllPullRequests();
  return data;
};