var httpContext = require("express-http-context");

function populateAuditColumnsCreate(
  entity = undefined,
  createdOnDate = undefined,
  updatedOnDate = undefined
) {
  const currentUser = httpContext.get("currentUser");
  const now = new Date();

  return {
    ...entity,
    createdBy: currentUser,
    createdOn: createdOnDate || now,
    updatedBy: currentUser,
    updatedOn: updatedOnDate || now,
  };
}

function populateAuditColumnsUpdate(
  entity = undefined,
  updatedOnDate = undefined
) {
  const currentUser = httpContext.get("currentUser");
  const now = new Date();

  return {
    ...entity,
    updatedBy: currentUser,
    updatedOn: updatedOnDate || now,
  };
}

module.exports = { populateAuditColumnsCreate, populateAuditColumnsUpdate };
