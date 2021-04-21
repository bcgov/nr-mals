const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

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
    createdOn: input.create_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    first_name: input.firstName,
    last_name: input.lastName,
    official_title: input.officialTitle,
    primary_phone: input.primaryPhone,
    email_address: input.email,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  if (!update) {
    output.create_userid = input.createdBy;
    output.create_timestamp = input.createdOn;
  }

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
        populateAuditColumnsCreate(input, date, date),
        false
      ),
    },
  };

  return output;
}

function convertToUpdatePhysicalModel(input, date) {
  const output = {
    where: { id: input.id },
    data: convertToPhysicalModel(populateAuditColumnsUpdate(input, date), true),
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertToNewLicenceXrefPhysicalModel,
  convertToUpdatePhysicalModel,
};
