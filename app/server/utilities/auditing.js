const { getCurrentUser } = require("./user");

function populateAuditingColumns(
  entity = undefined,
  createdOnDate = undefined,
  updatedOnDate = undefined
) {
  const currentUser = getCurrentUser();
  const now = new Date();

  return {
    ...entity,
    createdBy: currentUser.idir,
    createdOn: createdOnDate || now,
    updatedBy: currentUser.idir,
    updatedOn: updatedOnDate || now,
  };
}

module.exports = { populateAuditingColumns };
