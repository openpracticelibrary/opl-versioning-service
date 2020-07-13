const githubapi = require("./githubapi");

exports.proposedChanges = async function proposedChanges() {
  const proposedChanges = await githubapi.getAllProposedChanges();
  console.log(proposedChanges);
  return proposedChanges.map((proposedChange) => {
    proposedChange.number;
  });
};
