const { getCurrentUser } = require("./user");

function populateAuditColumnsCreate(
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

function populateAuditColumnsUpdate(
  entity = undefined,
  updatedOnDate = undefined
) {
  const currentUser = getCurrentUser();
  const now = new Date();

  return {
    ...entity,
    updatedBy: currentUser.idir,
    updatedOn: updatedOnDate || now,
  };
}

module.exports = { populateAuditColumnsCreate, populateAuditColumnsUpdate };
