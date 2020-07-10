const { githubApi } = require("../config/githubConfig");
const { config } = require("../config/config");
const { v4: uuidv4 } = require("uuid");

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
 *  <li> Associate User with PR in Content-Api-Service </li>
 * </ul>
 *
 */
async function proposeChange(user, practice) {
  const encodedPractice = Buffer.from(JSON.stringify(practice)).toString(
    "base64"
  );

  const ref = createRefString(user, practice);
  const lastCommitSha = await getLatestCommitOnMaster();
  const newBranchResponse = await createNewBranch(ref, lastCommitSha);

  const isExistingPractice = await checkIfExistingPractice(practice.slug);

  const fileUploadResponse = await octokit.repos.createOrUpdateFileContents({
    owner: config.org,
    repo: config.repo,
    path: practice.slug + ".json",
    ...(isExistingPractice && { sha: existingFile.data.sha }),
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

  const pullRequestResponse = await octokit.pulls.create({
    owner: config.org,
    repo: config.repo,
    title: "PR to " + practice.title + " by " + user.username,
    head: ref,
    base: config.base,
  });

  return pullRequestResponse;

}

function createRefString(user, practice) {
  return "refs/heads/" + user.username + "_" + practice.slug + "_" + uuidv4();
}

async function getLatestCommitOnMaster() {
  const { data: sha } = await githubApi.repos.getCommit({
    owner: config.org,
    repo: config.repo,
    ref: config.base,
  });

  return sha;
}

async function createNewBranch(ref, lastCommitSha) {
  return githubApi.git.createRef({
    owner: config.org,
    repo: config.repo,
    ref: ref,
    sha: lastCommitSha,
  });
}

async function checkIfExistingPractice(slug) {
  const { status } = await octokit.repos.getContent({
    owner: config.org,
    repo: config.repo,
    path: slug + ".json",
    ref: config.base,
  });

  status === 200 ? true : false;
}
