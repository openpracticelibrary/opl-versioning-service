const githubapi = require("./githubapi");
const utils = require("./utils");

exports.proposedChanges = async function proposedChanges() {
  const proposedChanges = await githubapi.getAllProposedChanges();

  const returnVal = proposedChanges.map((proposedChange) => {
    const slug = exports.getPracticeSlug(proposedChange);
    return {
      number: proposedChange.number,
      practiceSlug: slug,
    };
  });

  return returnVal;

};




exports.getPracticeSlug = function getPracticeSlug(proposedChange) {
  try {
    return utils.extractPracticeFromLabelsOnPullRequest(proposedChange.labels);
  } catch (err) {
    //console.log(err);
  }

  return "unknown";
};

exports.getMergeableStatus = async function getMergeableStatus(proposedChange) {
  return await utils.determineMergeableStatus(proposedChange.number);
};

exports.getProposedChange = async function getProposedChange(
  pullRequestNumber
) {
  return githubapi.getProposedChange(pullRequestNumber);
};

exports.getDiffFromPullRequest = async function getDiffFromPullRequest(
  pullRequestNumber
) {
  const diffValue = await utils.getDiffFromPullRequest(pullRequestNumber);
  return { diff: diffValue };
};

exports.proposeChange = async function proposeChange(user, practice) {
  console.log(practice);
  const data = await githubapi.proposeChange(user, practice);
  return { response: "done" };
};
