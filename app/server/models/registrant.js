const { populateAuditColumnsCreate } = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    firstName: input.first_name,
    lastName: input.last_name,
    officialTitle: input.official_title,
    companyName: input.company_name,
    primaryPhone: input.primary_phone,
    email: input.email_address,
    status: "existing",
    label: input.company_name
      ? input.company_name
      : `${input.last_name}, ${input.first_name}`,
  };

  return output;
}

function convertToPhysicalModel(input) {
  const output = {
    id: input.id,
    first_name: input.firstName,
    last_name: input.lastName,
    official_title: input.officialTitle,
    company_name: input.companyName,
    primary_phone: input.primaryPhone,
    email_address: input.email,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

function convertLicenceXrefToPhysicalModel(input) {
  const output = {
    id: input.id,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

function convertToNewLicenceXrefPhysicalModel(input, licenceId, date) {
  const output = {
    ...convertLicenceXrefToPhysicalModel(
      populateAuditColumnsCreate(undefined, date, date)
    ),
    mal_licence: {
      connect: { id: licenceId },
    },
    mal_registrant: {
      create: convertToPhysicalModel(
        populateAuditColumnsCreate(input, date, date)
      ),
    },
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertToNewLicenceXrefPhysicalModel,
};
