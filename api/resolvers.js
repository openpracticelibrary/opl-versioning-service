const githubapi = require("./githubapi");
const utils = require("./utils");

exports.proposedChanges = async function proposedChanges() {
  const proposedChanges = await githubapi.getAllProposedChanges();
  return proposedChanges.map((proposedChange) => {
    return { number: proposedChange.number };
  });
};

exports.getPracticeSlug = function getPracticeSlug(proposedChange) {
  try {
    return utils.extractPracticeFromLabelsOnPullRequest(proposedChange.labels);
  } catch (err) {
    console.log(err);
  }

  return null;
};
